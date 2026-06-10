"""
FastAPI application entry point.

Startup sequence:
  1. Load env vars
  2. Configure CORS (from CORS_ORIGINS env)
  3. Add custom middleware (security headers, request logging)
  4. Register rate limiter
  5. Mount all routers
  6. Create DB indexes on first boot
  7. Mount /uploads static directory

Run:
  uvicorn main:app --reload --port 8000
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from core.config import settings
from core.middleware import RequestLoggingMiddleware, SecurityHeadersMiddleware
from database import create_indexes
from routers import admin, auth, items, uploads, users

load_dotenv()

# ── Rate Limiter ──
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ── Lifespan (startup / shutdown) ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup tasks then yield; run shutdown tasks after yield."""
    print(f"[APP] Starting {settings.app_name} API...")
    try:
        await create_indexes()
    except Exception as exc:
        print(f"[APP] Warning: Index creation deferred — {exc}")
    print("[APP] Ready.")
    yield
    print("[APP] Shutting down.")


# ── Application ──
app = FastAPI(
    title=f"{settings.app_name} API",
    version="1.0.0",
    description=(
        "Production-grade fullstack Python API. "
        "JWT auth · Role-based access control · OTP verification · Google OAuth"
    ),
    lifespan=lifespan,
    # Hide docs in production for security
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# ── Rate limiter state & error handler ──
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS — must be first middleware ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"],
)

# ── Custom Middleware ──
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)

# ── Routers ──
app.include_router(auth.router,    prefix="/auth",    tags=["Authentication"])
app.include_router(users.router,   prefix="/users",   tags=["Users"])
app.include_router(items.router,   prefix="/items",   tags=["Items"])
app.include_router(admin.router,   prefix="/admin",   tags=["Admin"])
app.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])

# ── Static Files (local upload fallback) ──
import os
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ── Health & Root ──
@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "ok",
        "environment": settings.app_env,
    }


@app.get("/health", tags=["Health"])
async def health():
    """Kubernetes / load-balancer health probe endpoint."""
    return {"status": "healthy"}
