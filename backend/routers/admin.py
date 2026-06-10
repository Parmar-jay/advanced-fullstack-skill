"""
Admin router — admin-only endpoints for user management and platform statistics.
All routes require role=admin (enforced via require_admin dependency).

  GET  /admin/stats           Platform statistics
  GET  /admin/users           Paginated user list with search
  GET  /admin/users/{id}      Get single user
  PUT  /admin/users/{id}      Update user role/status/verification
  DELETE /admin/users/{id}    Soft-delete a user
  GET  /admin/login-history   Recent login history (all users)
"""
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from core.deps import require_admin
from database import db
from models.schemas import AdminUpdateUserIn, MessageOut, StatsOut

router = APIRouter()


def _user_safe(u: dict) -> dict:
    """Shape user doc for admin response (includes internal fields)."""
    return {
        "id": str(u["_id"]),
        "email": u.get("email", ""),
        "full_name": u.get("full_name", ""),
        "username": u.get("username"),
        "role": u.get("role", "customer"),
        "account_status": u.get("account_status", "active"),
        "is_verified": u.get("is_verified", False),
        "provider_type": u.get("provider_type", "email"),
        "last_login": u.get("last_login"),
        "failed_login_attempts": u.get("failed_login_attempts", 0),
        "created_at": u.get("created_at"),
        "deleted_at": u.get("deleted_at"),
    }


# ══════════════════════════════════════════════
#  STATS
# ══════════════════════════════════════════════

@router.get("/stats", response_model=StatsOut)
async def get_stats(_admin: dict = Depends(require_admin)):
    """Return platform-wide statistics."""
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"account_status": "active"})
    verified_users = await db.users.count_documents({"is_verified": True})
    total_items = await db.items.count_documents({})

    return {
        "total_users": total_users,
        "active_users": active_users,
        "verified_users": verified_users,
        "total_items": total_items,
    }


# ══════════════════════════════════════════════
#  USER LIST
# ══════════════════════════════════════════════

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    _admin: dict = Depends(require_admin),
):
    """Paginated user list with optional search, role, and status filters."""
    query: dict = {}

    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
            {"username": {"$regex": search, "$options": "i"}},
        ]
    if role:
        query["role"] = role
    if status:
        query["account_status"] = status

    total = await db.users.count_documents(query)
    skip = (page - 1) * per_page

    cursor = (
        db.users.find(query, {"password_hash": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(per_page)
    )

    users = []
    async for doc in cursor:
        users.append(_user_safe(doc))

    return {
        "users": users,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, -(-total // per_page)),
    }


# ══════════════════════════════════════════════
#  GET SINGLE USER
# ══════════════════════════════════════════════

@router.get("/users/{user_id}")
async def get_user(user_id: str, _admin: dict = Depends(require_admin)):
    """Retrieve a single user by ID (admin view)."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(400, "Invalid user ID format")

    user = await db.users.find_one({"_id": oid}, {"password_hash": 0})
    if not user:
        raise HTTPException(404, "User not found")

    return _user_safe(user)


# ══════════════════════════════════════════════
#  UPDATE USER
# ══════════════════════════════════════════════

@router.put("/users/{user_id}", response_model=dict)
async def update_user(
    user_id: str,
    payload: AdminUpdateUserIn,
    _admin: dict = Depends(require_admin),
):
    """Update a user's role, account_status, or is_verified flag."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(400, "Invalid user ID format")

    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(404, "User not found")

    update_data: dict = {"updated_at": datetime.now(timezone.utc)}

    if payload.role is not None:
        update_data["role"] = payload.role.value
    if payload.account_status is not None:
        update_data["account_status"] = payload.account_status.value
        # Revoke tokens when suspending
        if payload.account_status.value == "suspended":
            await db.refresh_tokens.delete_many({"user_id": user_id})
    if payload.is_verified is not None:
        update_data["is_verified"] = payload.is_verified

    await db.users.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.users.find_one({"_id": oid}, {"password_hash": 0})
    return _user_safe(updated)


# ══════════════════════════════════════════════
#  DELETE (soft) USER
# ══════════════════════════════════════════════

@router.delete("/users/{user_id}", response_model=MessageOut)
async def delete_user(user_id: str, _admin: dict = Depends(require_admin)):
    """Soft-delete a user (sets account_status=deactivated, deleted_at)."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(400, "Invalid user ID format")

    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(404, "User not found")

    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": oid},
        {"$set": {"account_status": "deactivated", "deleted_at": now, "updated_at": now}},
    )
    await db.refresh_tokens.delete_many({"user_id": user_id})
    return {"ok": True, "message": f"User {user_id} deactivated"}


# ══════════════════════════════════════════════
#  LOGIN HISTORY (all users)
# ══════════════════════════════════════════════

@router.get("/login-history")
async def all_login_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    user_id: Optional[str] = Query(None),
    success: Optional[bool] = Query(None),
    _admin: dict = Depends(require_admin),
):
    """Return paginated login audit log across all users."""
    query: dict = {}
    if user_id:
        query["user_id"] = user_id
    if success is not None:
        query["success"] = success

    total = await db.login_history.count_documents(query)
    skip = (page - 1) * per_page

    cursor = (
        db.login_history.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(per_page)
    )

    history = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        history.append(doc)

    return {
        "history": history,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, -(-total // per_page)),
    }
