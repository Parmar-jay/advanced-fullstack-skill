"""
Pydantic v2 schemas — request validation & response serialization for all domains.

Conventions:
  - Input schemas end in `In`   (e.g. LoginIn, CreateItemIn)
  - Output schemas end in `Out` (e.g. UserOut, ItemOut)
  - Use `field_validator` for custom business rules
  - EmailStr auto-validates email format
"""
import re
from datetime import datetime
from enum import Enum
from typing import Any, Optional, List

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# ══════════════════════════════════════════════
#  ENUMS
# ══════════════════════════════════════════════

class ProviderType(str, Enum):
    email = "email"
    google = "google"


class AccountStatus(str, Enum):
    active = "active"
    suspended = "suspended"
    deactivated = "deactivated"


class UserRole(str, Enum):
    customer = "customer"
    admin = "admin"
    manager = "manager"


class ItemStatus(str, Enum):
    active = "active"
    draft = "draft"
    archived = "archived"


# ══════════════════════════════════════════════
#  SHARED / ADDRESS
# ══════════════════════════════════════════════

class Address(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    line1: Optional[str] = None
    line2: Optional[str] = ""
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "US"


# ══════════════════════════════════════════════
#  USER SCHEMAS
# ══════════════════════════════════════════════

class UserOut(BaseModel):
    """Public user profile — safe to return to clients."""
    id: str
    email: str
    full_name: str
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "customer"
    provider_type: str = "email"
    is_verified: bool = False
    phone: Optional[str] = None
    address: Optional[Address] = None
    created_at: Optional[datetime] = None


class UpdateProfileIn(BaseModel):
    """Fields allowed to be updated by the user themselves."""
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[Address] = None
    avatar_url: Optional[str] = None


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


# ══════════════════════════════════════════════
#  AUTH SCHEMAS
# ══════════════════════════════════════════════

class SignupIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=30)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Must contain at least one digit")
        return v

    @field_validator("username")
    @classmethod
    def username_format(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v.lower() if v else v


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthIn(BaseModel):
    """Accept Google ID token from the frontend Google Sign-In button."""
    credential: str  # ID token from Google


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshTokenIn(BaseModel):
    refresh_token: str


# ══════════════════════════════════════════════
#  OTP / PASSWORD RESET SCHEMAS
# ══════════════════════════════════════════════

class ForgotPasswordIn(BaseModel):
    email: EmailStr


class VerifyOtpIn(BaseModel):
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)


class ResetPasswordIn(BaseModel):
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Must contain at least one digit")
        return v


class ResendOtpIn(BaseModel):
    email: EmailStr


# ══════════════════════════════════════════════
#  ITEM SCHEMAS (generic CRUD example)
# ══════════════════════════════════════════════

class CreateItemIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    tags: Optional[List[str]] = []
    status: ItemStatus = ItemStatus.active
    metadata: Optional[dict] = {}


class UpdateItemIn(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    tags: Optional[List[str]] = None
    status: Optional[ItemStatus] = None
    metadata: Optional[dict] = None


class ItemOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    tags: List[str] = []
    status: str
    owner_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None


class ItemListOut(BaseModel):
    items: List[ItemOut]
    total: int
    page: int
    per_page: int
    total_pages: int


# ══════════════════════════════════════════════
#  ADMIN SCHEMAS
# ══════════════════════════════════════════════

class AdminUpdateUserIn(BaseModel):
    role: Optional[UserRole] = None
    account_status: Optional[AccountStatus] = None
    is_verified: Optional[bool] = None


class AdminUserListOut(BaseModel):
    users: List[dict]
    total: int
    page: int
    per_page: int


class StatsOut(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    total_items: int


# ══════════════════════════════════════════════
#  UPLOAD SCHEMAS
# ══════════════════════════════════════════════

class UploadOut(BaseModel):
    url: str
    public_id: str
    width: Optional[int] = None
    height: Optional[int] = None
    format: Optional[str] = None
    bytes: Optional[int] = None


# ══════════════════════════════════════════════
#  GENERIC RESPONSE
# ══════════════════════════════════════════════

class MessageOut(BaseModel):
    ok: bool = True
    message: str


class ErrorOut(BaseModel):
    ok: bool = False
    detail: str
