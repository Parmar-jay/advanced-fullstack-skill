"""
Security utilities — password hashing, JWT (access + refresh), OTP generation.
Algorithms: bcrypt (primary) with argon2 as upgrade path.
"""
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from core.config import settings

# ── Password Hashing ──
# bcrypt is primary; argon2 is the upgrade path when `needs_rehash` returns True
pwd_context = CryptContext(schemes=["bcrypt", "argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password. Raises ValueError if > 72 chars (bcrypt limit)."""
    password = password.strip()
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password cannot be longer than 72 characters")
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify plaintext password against stored hash."""
    return pwd_context.verify(plain, hashed)


def needs_rehash(hashed: str) -> bool:
    """Return True when stored hash should be upgraded to a newer algorithm."""
    return pwd_context.needs_update(hashed)


# ── Access Token ──

def create_access_token(subject: str, extra: dict | None = None) -> str:
    """Create a short-lived JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expire, "type": "access"}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate an access token. Returns payload dict or None."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


# ── Refresh Token ──

def create_refresh_token(subject: str) -> str:
    """Create a long-lived JWT refresh token."""
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    payload = {"sub": subject, "exp": expire, "type": "refresh"}
    return jwt.encode(
        payload, settings.jwt_refresh_secret, algorithm=settings.jwt_algorithm
    )


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decode and validate a refresh token. Returns payload dict or None."""
    try:
        payload = jwt.decode(
            token, settings.jwt_refresh_secret, algorithms=[settings.jwt_algorithm]
        )
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


# ── OTP & Secure Tokens ──

def generate_otp(length: int = 6) -> str:
    """Generate a cryptographically secure numeric OTP."""
    return "".join(secrets.choice(string.digits) for _ in range(length))


def generate_secure_token(nbytes: int = 64) -> str:
    """Generate a URL-safe cryptographically secure random token."""
    return secrets.token_urlsafe(nbytes)
