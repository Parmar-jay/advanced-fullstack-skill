"""
MongoDB connection and collection references.
Uses Motor (async driver) for non-blocking I/O.

Collections:
  users             — registered accounts
  pending_signups   — unverified registration data (TTL auto-cleanup)
  refresh_tokens    — issued refresh tokens (TTL auto-cleanup)
  otp_logs          — password-reset OTPs (TTL auto-cleanup)
  login_history     — audit log of all login attempts
  items             — generic CRUD example (replace with your domain models)
"""
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME: str = os.getenv("DB_NAME", "myapp")

# AsyncIOMotorClient is thread-safe and should be created once at startup
client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]

# ── Collection References ──
# Auth
users = db["users"]
pending_signups = db["pending_signups"]
refresh_tokens = db["refresh_tokens"]
otp_logs = db["otp_logs"]
login_history = db["login_history"]

# Domain (example — replace with your own)
items = db["items"]


async def create_indexes() -> None:
    """
    Create MongoDB indexes for performance and uniqueness constraints.
    Called once at application startup.
    TTL indexes (expireAfterSeconds=0) use the document's own `expires_at` field.
    """

    # ── Users ──
    await users.create_index("email", unique=True)
    await users.create_index("username", unique=True, sparse=True)
    await users.create_index("role")
    await users.create_index("account_status")
    await users.create_index("is_verified")
    await users.create_index("provider_type")
    await users.create_index([("email", 1), ("provider_type", 1)])
    await users.create_index("created_at")

    # ── Pending Signups (unverified registrations — auto-expire) ──
    await pending_signups.create_index("email", unique=True)
    await pending_signups.create_index("expires_at", expireAfterSeconds=0)

    # ── Refresh Tokens (auto-expire via TTL) ──
    await refresh_tokens.create_index("user_id")
    await refresh_tokens.create_index("token", unique=True)
    await refresh_tokens.create_index("expires_at", expireAfterSeconds=0)

    # ── OTP Logs (password reset — auto-expire) ──
    await otp_logs.create_index("email")
    await otp_logs.create_index("expires_at", expireAfterSeconds=0)
    await otp_logs.create_index([("email", 1), ("is_used", 1)])

    # ── Login History (audit trail) ──
    await login_history.create_index("user_id")
    await login_history.create_index("ip_address")
    await login_history.create_index("created_at")

    # ── Items (example CRUD collection) ──
    await items.create_index("owner_id")
    await items.create_index("created_at")
    await items.create_index([("title", "text"), ("description", "text")])

    print("[DB] Indexes created successfully.")
