"""
FastAPI dependency injection — authentication guards and role-based access control.

Usage in routers:
    @router.get("/protected")
    async def protected(user=Depends(get_current_user)):
        ...

    @router.get("/admin-only")
    async def admin(user=Depends(require_admin)):
        ...

    @router.get("/manager-or-admin")
    async def manager(user=Depends(require_role("manager", "admin"))):
        ...
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId

from database import db
from core.security import decode_access_token

# Points to the login endpoint so Swagger UI shows the Authorize button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Validate Bearer access token and return the authenticated user document.
    Raises 401 if token is missing, invalid, or user is suspended.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    try:
        user = await db.users.find_one(
            {"_id": ObjectId(user_id), "account_status": {"$ne": "suspended"}}
        )
    except Exception:
        user = None

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account suspended",
        )

    # Expose string id for convenience
    user["id"] = str(user["_id"])
    return user


async def get_current_user_optional(
    token: str = Depends(oauth2_scheme),
) -> dict | None:
    """Return current user if token is valid, otherwise None (no error)."""
    if not token:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Restrict access to users with the 'admin' role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def require_role(*roles: str):
    """
    Dependency factory that restricts access to one or more roles.

    Example:
        @router.get("/")
        async def route(user=Depends(require_role("manager", "admin"))):
            ...
    """

    async def _check(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role", "customer") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access requires one of roles: {', '.join(roles)}",
            )
        return user

    return _check
