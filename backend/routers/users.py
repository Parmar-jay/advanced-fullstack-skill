"""
Users router — profile management endpoints for authenticated users.
  GET  /users/me/history        Login history
  POST /users/me/change-password Change password (requires current password)
  DELETE /users/me              Soft-delete account
"""
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from core.deps import get_current_user
from core.email import send_password_changed_email
from core.middleware import sanitize_string
from core.security import hash_password, verify_password
from database import db
from models.schemas import ChangePasswordIn, MessageOut, UserOut

router = APIRouter()


@router.get("/me/history")
async def login_history(
    current_user: dict = Depends(get_current_user),
    limit: int = 20,
):
    """Return the last N login events for the current user."""
    cursor = (
        db.login_history.find({"user_id": current_user["id"]})
        .sort("created_at", -1)
        .limit(max(1, min(limit, 100)))
    )
    history = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        history.append(doc)
    return {"history": history}


@router.post("/me/change-password", response_model=MessageOut)
async def change_password(
    payload: ChangePasswordIn,
    current_user: dict = Depends(get_current_user),
):
    """
    Change the authenticated user's password.
    Requires the current password for verification.
    Revokes all refresh tokens (forces re-login on all devices).
    """
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    if not user:
        raise HTTPException(404, "User not found")

    if not user.get("password_hash"):
        raise HTTPException(
            400,
            "This account uses Google Sign-In and has no password. "
            "Set a password first via the forgot-password flow.",
        )

    if not verify_password(payload.current_password, user["password_hash"]):
        raise HTTPException(401, "Current password is incorrect")

    if payload.current_password == payload.new_password:
        raise HTTPException(400, "New password must differ from the current one")

    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "password_hash": hash_password(payload.new_password),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    # Revoke all refresh tokens — user must log in again
    await db.refresh_tokens.delete_many({"user_id": current_user["id"]})

    import asyncio
    asyncio.create_task(
        send_password_changed_email(user["email"], user.get("full_name", ""))
    )

    return {"ok": True, "message": "Password changed. Please sign in again."}


@router.delete("/me", response_model=MessageOut)
async def delete_account(current_user: dict = Depends(get_current_user)):
    """
    Soft-delete the current user's account.
    Sets account_status to 'deactivated' and deleted_at timestamp.
    All refresh tokens are revoked.
    """
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "account_status": "deactivated",
                "deleted_at": now,
                "updated_at": now,
            }
        },
    )
    await db.refresh_tokens.delete_many({"user_id": current_user["id"]})
    return {"ok": True, "message": "Account deactivated successfully."}
