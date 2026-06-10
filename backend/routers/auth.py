"""
Authentication router — full auth lifecycle:
  POST /auth/signup                  Register with OTP email verification
  POST /auth/signup/verify           Verify OTP → create account → return JWT pair
  POST /auth/signup/resend-otp       Resend signup OTP with cooldown
  POST /auth/login                   Email/password login → JWT pair
  POST /auth/refresh                 Rotate refresh token
  POST /auth/logout                  Revoke all refresh tokens
  GET  /auth/me                      Get current user profile
  PUT  /auth/me                      Update current user profile
  POST /auth/google                  Google ID token → login or register
  POST /auth/forgot-password         Send OTP for password reset
  POST /auth/verify-otp              Verify reset OTP (doesn't consume it)
  POST /auth/reset-password          Reset password using OTP
  POST /auth/resend-otp              Resend reset OTP with cooldown
"""
from datetime import datetime, timedelta, timezone

import httpx
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm

from core.config import settings
from core.deps import get_current_user
from core.email import (
    send_password_changed_email,
    send_password_reset_otp_email,
    send_signup_otp_email,
    send_welcome_email,
)
from core.middleware import sanitize_string
from core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    generate_otp,
    hash_password,
    needs_rehash,
    verify_password,
)
from database import db
from models.schemas import (
    ForgotPasswordIn,
    GoogleAuthIn,
    RefreshTokenIn,
    ResendOtpIn,
    ResetPasswordIn,
    SignupIn,
    TokenOut,
    UpdateProfileIn,
    UserOut,
    VerifyOtpIn,
)

router = APIRouter()

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


# ══════════════════════════════════════════════
#  INTERNAL HELPERS
# ══════════════════════════════════════════════

def _user_public(u: dict) -> dict:
    """Shape a MongoDB user document into a safe public API response."""
    return {
        "id": str(u["_id"]),
        "email": u.get("email", ""),
        "full_name": u.get("full_name", ""),
        "username": u.get("username"),
        "avatar_url": u.get("avatar_url"),
        "role": u.get("role", "customer"),
        "provider_type": u.get("provider_type", "email"),
        "is_verified": u.get("is_verified", False),
        "phone": u.get("phone", ""),
        "address": u.get("address"),
        "created_at": u.get("created_at"),
    }


async def _store_refresh_token(user_id: str, token: str) -> None:
    """Persist a new refresh token in the database."""
    await db.refresh_tokens.insert_one(
        {
            "user_id": user_id,
            "token": token,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc)
            + timedelta(days=settings.refresh_token_expire_days),
        }
    )


async def _log_login(
    user_id: str, request: Request, method: str, success: bool
) -> None:
    """Append an entry to the login audit log."""
    await db.login_history.insert_one(
        {
            "user_id": user_id,
            "ip_address": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", ""),
            "method": method,
            "success": success,
            "created_at": datetime.now(timezone.utc),
        }
    )


async def _check_login_throttle(email: str) -> None:
    """
    Raise HTTP 429 if the account is temporarily locked due to too many failed
    login attempts. Silently resets the counter when the lockout period has expired.
    """
    user = await db.users.find_one({"email": email.lower()})
    if not user:
        return  # Don't reveal whether the email exists

    failed: int = user.get("failed_login_attempts", 0)
    if failed < settings.max_login_attempts:
        return

    last_attempt: datetime | None = user.get("last_failed_login")
    if last_attempt:
        # Ensure timezone-aware
        if last_attempt.tzinfo is None:
            last_attempt = last_attempt.replace(tzinfo=timezone.utc)
        lockout_until = last_attempt + timedelta(minutes=settings.login_lockout_minutes)
        now = datetime.now(timezone.utc)
        if now < lockout_until:
            remaining = int((lockout_until - now).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Account temporarily locked. Try again in {remaining} minute(s).",
            )
        # Lockout expired — auto-reset
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"failed_login_attempts": 0}},
        )


async def _increment_failed_login(email: str) -> None:
    await db.users.update_one(
        {"email": email.lower()},
        {
            "$inc": {"failed_login_attempts": 1},
            "$set": {"last_failed_login": datetime.now(timezone.utc)},
        },
    )


async def _reset_failed_login(user_id: ObjectId) -> None:
    await db.users.update_one(
        {"_id": user_id},
        {
            "$set": {
                "failed_login_attempts": 0,
                "last_login": datetime.now(timezone.utc),
            }
        },
    )


def _build_token_response(user: dict) -> dict:
    """Issue access + refresh tokens and return the TokenOut payload."""
    user_id = str(user["_id"])
    access = create_access_token(user_id, {"role": user.get("role", "customer")})
    refresh = create_refresh_token(user_id)
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": _user_public(user),
    }


# ══════════════════════════════════════════════
#  SIGNUP — step 1: register → send OTP
# ══════════════════════════════════════════════

@router.post("/signup", response_model=dict)
async def signup(payload: SignupIn, request: Request):
    """
    Register a new user.
    Stores credentials in `pending_signups` (not `users`) until email is verified.
    Sends a 6-digit OTP to the provided email address.
    """
    email = payload.email.lower()

    # Reject if already a confirmed user
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")

    # Username generation & uniqueness
    username = payload.username
    if not username:
        base = payload.full_name.lower().replace(" ", "_")
        username = base
        counter = 1
        while await db.users.find_one({"username": username}):
            username = f"{base}_{counter}"
            counter += 1
    else:
        username = username.lower()
        if await db.users.find_one({"username": username}):
            raise HTTPException(400, "Username already taken")

    otp = generate_otp()
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(minutes=settings.otp_expiry_minutes)

    # Upsert into pending — supports re-registration after expiry
    await db.pending_signups.update_one(
        {"email": email},
        {
            "$set": {
                "full_name": sanitize_string(payload.full_name),
                "username": username,
                "password_hash": hash_password(payload.password),
                "otp_code": otp,
                "attempts": 0,
                "expires_at": expiry,
                "created_at": now,
            }
        },
        upsert=True,
    )

    sent = await send_signup_otp_email(email, otp, payload.full_name)
    if not sent:
        # Dev mode: OTP printed to stdout
        print(f"[SIGNUP OTP] {email}: {otp}")

    return {"ok": True, "message": "Verification code sent. Check your email."}


# ══════════════════════════════════════════════
#  SIGNUP — step 2: verify OTP → create account
# ══════════════════════════════════════════════

@router.post("/signup/verify", response_model=TokenOut)
async def signup_verify(payload: VerifyOtpIn, request: Request):
    """
    Verify the signup OTP.
    On success: creates the user, issues JWT pair, sends welcome email.
    """
    email = payload.email.lower()

    pending = await db.pending_signups.find_one(
        {"email": email, "expires_at": {"$gt": datetime.now(timezone.utc)}}
    )
    if not pending:
        raise HTTPException(
            400,
            "No pending registration or code expired. Please sign up again.",
        )

    # Brute-force protection
    if pending.get("attempts", 0) >= settings.otp_max_attempts:
        await db.pending_signups.delete_one({"email": email})
        raise HTTPException(429, "Too many incorrect attempts. Please sign up again.")

    if pending["otp_code"] != payload.otp_code:
        await db.pending_signups.update_one(
            {"email": email}, {"$inc": {"attempts": 1}}
        )
        remaining = settings.otp_max_attempts - pending.get("attempts", 0) - 1
        raise HTTPException(400, f"Invalid code. {remaining} attempt(s) remaining.")

    # Double-check race condition
    if await db.users.find_one({"email": email}):
        await db.pending_signups.delete_one({"email": email})
        raise HTTPException(400, "Email already registered")

    now = datetime.now(timezone.utc)
    user_doc = {
        "email": email,
        "full_name": pending["full_name"],
        "username": pending["username"],
        "password_hash": pending["password_hash"],
        "provider_type": "email",
        "avatar_url": None,
        "role": "customer",
        "is_verified": True,
        "account_status": "active",
        "failed_login_attempts": 0,
        "last_failed_login": None,
        "last_login": now,
        "phone": None,
        "address": None,
        "created_at": now,
        "updated_at": now,
        "deleted_at": None,
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    await db.pending_signups.delete_one({"email": email})

    response = _build_token_response(user_doc)
    await _store_refresh_token(str(result.inserted_id), response["refresh_token"])
    await _log_login(str(result.inserted_id), request, "signup", True)

    # Send welcome email async (fire and forget)
    import asyncio
    asyncio.create_task(send_welcome_email(email, user_doc["full_name"]))

    return response


# ══════════════════════════════════════════════
#  SIGNUP — resend OTP
# ══════════════════════════════════════════════

@router.post("/signup/resend-otp")
async def signup_resend_otp(payload: ResendOtpIn):
    email = payload.email.lower()

    pending = await db.pending_signups.find_one({"email": email})
    if not pending:
        raise HTTPException(400, "No pending registration found for this email.")

    # Cooldown
    created_at: datetime | None = pending.get("created_at")
    if created_at:
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        elapsed = (datetime.now(timezone.utc) - created_at).total_seconds()
        if elapsed < settings.otp_cooldown_seconds:
            remaining = int(settings.otp_cooldown_seconds - elapsed)
            raise HTTPException(429, f"Wait {remaining}s before requesting a new code.")

    otp = generate_otp()
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(minutes=settings.otp_expiry_minutes)

    await db.pending_signups.update_one(
        {"email": email},
        {
            "$set": {
                "otp_code": otp,
                "expires_at": expiry,
                "attempts": 0,
                "created_at": now,
            }
        },
    )

    sent = await send_signup_otp_email(email, otp, pending.get("full_name", ""))
    if not sent:
        print(f"[SIGNUP RESEND OTP] {email}: {otp}")

    return {"ok": True, "message": "Verification code resent."}


# ══════════════════════════════════════════════
#  LOGIN
# ══════════════════════════════════════════════

@router.post("/login", response_model=TokenOut)
async def login(request: Request, form: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate with email + password.
    Supports Swagger UI's built-in OAuth2 form (username field = email).
    Enforces brute-force lockout.
    """
    email = form.username.lower()

    await _check_login_throttle(email)

    user = await db.users.find_one({"email": email, "provider_type": "email"})
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    if user.get("account_status") == "suspended":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account suspended. Contact support.")

    if not user.get("password_hash"):
        raise HTTPException(
            400,
            "This account was created with Google Sign-In. Please use 'Continue with Google'.",
        )

    if not verify_password(form.password, user["password_hash"]):
        await _increment_failed_login(email)
        await _log_login(str(user["_id"]), request, "email", False)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    # Transparent algorithm upgrade (bcrypt → argon2)
    if needs_rehash(user["password_hash"]):
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"password_hash": hash_password(form.password)}},
        )

    await _reset_failed_login(user["_id"])

    response = _build_token_response(user)
    await _store_refresh_token(str(user["_id"]), response["refresh_token"])
    await _log_login(str(user["_id"]), request, "email", True)

    return response


# ══════════════════════════════════════════════
#  REFRESH TOKEN
# ══════════════════════════════════════════════

@router.post("/refresh", response_model=TokenOut)
async def refresh_token(payload: RefreshTokenIn):
    """
    Exchange a valid refresh token for a new JWT pair.
    Old token is deleted (one-time use / token rotation).
    """
    decoded = decode_refresh_token(payload.refresh_token)
    if not decoded:
        raise HTTPException(401, "Invalid or expired refresh token")

    stored = await db.refresh_tokens.find_one({"token": payload.refresh_token})
    if not stored:
        raise HTTPException(401, "Refresh token revoked or not found")

    user = await db.users.find_one({"_id": ObjectId(decoded["sub"])})
    if not user or user.get("account_status") == "suspended":
        raise HTTPException(401, "User not found or suspended")

    # Rotate: invalidate old, issue new
    await db.refresh_tokens.delete_one({"_id": stored["_id"]})

    response = _build_token_response(user)
    await _store_refresh_token(str(user["_id"]), response["refresh_token"])
    return response


# ══════════════════════════════════════════════
#  LOGOUT
# ══════════════════════════════════════════════

@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    """Revoke ALL refresh tokens for the current user (logs out all devices)."""
    await db.refresh_tokens.delete_many({"user_id": str(user["_id"])})
    return {"ok": True, "message": "Logged out successfully"}


# ══════════════════════════════════════════════
#  CURRENT USER — GET
# ══════════════════════════════════════════════

@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's full profile."""
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user.get("full_name", ""),
        "username": user.get("username"),
        "avatar_url": user.get("avatar_url"),
        "role": user.get("role", "customer"),
        "provider_type": user.get("provider_type", "email"),
        "is_verified": user.get("is_verified", False),
        "phone": user.get("phone"),
        "address": user.get("address"),
        "created_at": user.get("created_at"),
    }


# ══════════════════════════════════════════════
#  CURRENT USER — UPDATE
# ══════════════════════════════════════════════

@router.put("/me", response_model=UserOut)
async def update_me(
    payload: UpdateProfileIn,
    current_user: dict = Depends(get_current_user),
):
    """Update the authenticated user's profile (name, phone, address, avatar)."""
    update_data: dict = {}

    if payload.full_name is not None:
        update_data["full_name"] = sanitize_string(payload.full_name)
    if payload.phone is not None:
        update_data["phone"] = payload.phone
    if payload.address is not None:
        update_data["address"] = payload.address.model_dump(exclude_unset=True)
    if payload.avatar_url is not None:
        update_data["avatar_url"] = payload.avatar_url

    if not update_data:
        raise HTTPException(400, "No fields to update")

    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_data},
    )

    updated = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    return {
        "id": str(updated["_id"]),
        "email": updated["email"],
        "full_name": updated.get("full_name", ""),
        "username": updated.get("username"),
        "avatar_url": updated.get("avatar_url"),
        "role": updated.get("role", "customer"),
        "provider_type": updated.get("provider_type", "email"),
        "is_verified": updated.get("is_verified", False),
        "phone": updated.get("phone"),
        "address": updated.get("address"),
        "created_at": updated.get("created_at"),
    }


# ══════════════════════════════════════════════
#  GOOGLE OAUTH
# ══════════════════════════════════════════════

@router.post("/google", response_model=TokenOut)
async def google_auth(payload: GoogleAuthIn, request: Request):
    """
    Authenticate via Google ID token (from Google Sign-In / One Tap).
    Creates a new account if the email is not yet registered,
    or links Google to an existing email account.
    """
    if not settings.google_client_id:
        raise HTTPException(501, "Google OAuth is not configured on this server")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GOOGLE_TOKENINFO_URL,
            params={"id_token": payload.credential},
        )

    if resp.status_code != 200:
        raise HTTPException(401, "Invalid Google token")

    google_data = resp.json()

    # Validate that token was issued for THIS app
    if google_data.get("aud") != settings.google_client_id:
        raise HTTPException(401, "Token was not issued for this application")

    email: str = google_data.get("email", "").lower()
    if not email:
        raise HTTPException(400, "Google account has no email address")

    google_name: str = google_data.get("name", "")
    google_avatar: str = google_data.get("picture", "")
    email_verified: bool = google_data.get("email_verified", "false") == "true"

    existing = await db.users.find_one({"email": email})

    if existing:
        # Update last login and link Google if needed
        update = {"last_login": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}
        if existing.get("provider_type") == "email":
            # Merge: link Google to existing email account
            update["provider_type"] = "google"
            update["avatar_url"] = google_avatar or existing.get("avatar_url")
            update["is_verified"] = True

        await db.users.update_one({"_id": existing["_id"]}, {"$set": update})
        existing = await db.users.find_one({"_id": existing["_id"]})

        response = _build_token_response(existing)
        await _store_refresh_token(str(existing["_id"]), response["refresh_token"])
        await _log_login(str(existing["_id"]), request, "google", True)
        return response

    # New user via Google — auto-generate unique username
    base_username = email.split("@")[0].lower().replace(".", "_")
    username = base_username
    counter = 1
    while await db.users.find_one({"username": username}):
        username = f"{base_username}_{counter}"
        counter += 1

    now = datetime.now(timezone.utc)
    user_doc = {
        "email": email,
        "full_name": sanitize_string(google_name),
        "username": username,
        "password_hash": None,
        "provider_type": "google",
        "avatar_url": google_avatar,
        "role": "customer",
        "is_verified": email_verified,
        "account_status": "active",
        "failed_login_attempts": 0,
        "last_failed_login": None,
        "last_login": now,
        "phone": None,
        "address": None,
        "created_at": now,
        "updated_at": now,
        "deleted_at": None,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    response = _build_token_response(user_doc)
    await _store_refresh_token(str(result.inserted_id), response["refresh_token"])
    await _log_login(str(result.inserted_id), request, "google", True)

    return response


# ══════════════════════════════════════════════
#  FORGOT PASSWORD — send OTP
# ══════════════════════════════════════════════

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordIn):
    """
    Send a password-reset OTP to the email.
    Always returns 200 to prevent email enumeration.
    """
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})

    # Always return 200 — don't leak whether email exists
    if not user:
        return {"ok": True, "message": "If that email exists, a reset code was sent."}

    # Cooldown: prevent spam
    recent = await db.otp_logs.find_one(
        {
            "email": email,
            "is_used": False,
            "created_at": {
                "$gte": datetime.now(timezone.utc)
                - timedelta(seconds=settings.otp_cooldown_seconds)
            },
        }
    )
    if recent:
        raise HTTPException(
            429,
            f"Please wait {settings.otp_cooldown_seconds}s before requesting a new code.",
        )

    otp = generate_otp()
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(minutes=settings.otp_expiry_minutes)

    # Invalidate all previous active OTPs for this email
    await db.otp_logs.update_many(
        {"email": email, "is_used": False},
        {"$set": {"is_used": True}},
    )

    await db.otp_logs.insert_one(
        {
            "email": email,
            "otp_code": otp,
            "attempts": 0,
            "is_used": False,
            "created_at": now,
            "expires_at": expiry,
        }
    )

    sent = await send_password_reset_otp_email(
        email, otp, user.get("full_name", "")
    )
    if not sent:
        print(f"[RESET OTP] {email}: {otp}")

    return {"ok": True, "message": "If that email exists, a reset code was sent."}


# ══════════════════════════════════════════════
#  VERIFY OTP (without consuming it)
# ══════════════════════════════════════════════

@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpIn):
    """
    Verify a password-reset OTP.
    Does NOT mark it as used — that happens in /reset-password.
    """
    email = payload.email.lower()

    otp_record = await db.otp_logs.find_one(
        {
            "email": email,
            "is_used": False,
            "expires_at": {"$gt": datetime.now(timezone.utc)},
        },
        sort=[("created_at", -1)],
    )

    if not otp_record:
        raise HTTPException(400, "No valid OTP found. Please request a new one.")

    if otp_record.get("attempts", 0) >= settings.otp_max_attempts:
        await db.otp_logs.update_one(
            {"_id": otp_record["_id"]}, {"$set": {"is_used": True}}
        )
        raise HTTPException(429, "Too many incorrect attempts. Request a new code.")

    if otp_record["otp_code"] != payload.otp_code:
        await db.otp_logs.update_one(
            {"_id": otp_record["_id"]}, {"$inc": {"attempts": 1}}
        )
        remaining = settings.otp_max_attempts - otp_record.get("attempts", 0) - 1
        raise HTTPException(400, f"Invalid code. {remaining} attempt(s) remaining.")

    return {"ok": True, "message": "OTP verified"}


# ══════════════════════════════════════════════
#  RESET PASSWORD
# ══════════════════════════════════════════════

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordIn):
    """
    Reset password using verified OTP.
    - Invalidates the OTP after use
    - Revokes all refresh tokens (forces re-login on all devices)
    - Sends password-changed notification email
    """
    email = payload.email.lower()

    otp_record = await db.otp_logs.find_one(
        {
            "email": email,
            "otp_code": payload.otp_code,
            "is_used": False,
            "expires_at": {"$gt": datetime.now(timezone.utc)},
        },
        sort=[("created_at", -1)],
    )

    if not otp_record:
        raise HTTPException(400, "Invalid or expired OTP")

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")

    now = datetime.now(timezone.utc)

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password_hash": hash_password(payload.new_password),
                "failed_login_attempts": 0,
                "last_failed_login": None,
                "updated_at": now,
            }
        },
    )

    # Consume OTP
    await db.otp_logs.update_one(
        {"_id": otp_record["_id"]}, {"$set": {"is_used": True}}
    )

    # Revoke all sessions — force re-login
    await db.refresh_tokens.delete_many({"user_id": str(user["_id"])})

    # Notify user
    import asyncio
    asyncio.create_task(
        send_password_changed_email(email, user.get("full_name", ""))
    )

    return {"ok": True, "message": "Password reset successfully. Please sign in."}


# ══════════════════════════════════════════════
#  RESEND OTP (for password reset)
# ══════════════════════════════════════════════

@router.post("/resend-otp")
async def resend_otp(payload: ResendOtpIn):
    """Resend a password-reset OTP with cooldown enforcement."""
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})

    # Always 200 — anti-enumeration
    if not user:
        return {"ok": True, "message": "If that email exists, a new code was sent."}

    recent = await db.otp_logs.find_one(
        {
            "email": email,
            "is_used": False,
            "created_at": {
                "$gte": datetime.now(timezone.utc)
                - timedelta(seconds=settings.otp_cooldown_seconds)
            },
        }
    )
    if recent:
        created_at = recent["created_at"]
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        elapsed = (datetime.now(timezone.utc) - created_at).total_seconds()
        remaining = max(0, int(settings.otp_cooldown_seconds - elapsed))
        raise HTTPException(429, f"Wait {remaining}s before requesting a new code.")

    otp = generate_otp()
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(minutes=settings.otp_expiry_minutes)

    await db.otp_logs.update_many(
        {"email": email, "is_used": False}, {"$set": {"is_used": True}}
    )
    await db.otp_logs.insert_one(
        {
            "email": email,
            "otp_code": otp,
            "attempts": 0,
            "is_used": False,
            "created_at": now,
            "expires_at": expiry,
        }
    )

    sent = await send_password_reset_otp_email(email, otp, user.get("full_name", ""))
    if not sent:
        print(f"[RESEND OTP] {email}: {otp}")

    return {"ok": True, "message": "New code sent."}
