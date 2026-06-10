"""
Middleware — security headers, request logging, input sanitization helpers.

SecurityHeadersMiddleware: Injects OWASP-recommended HTTP security headers on every response.
RequestLoggingMiddleware: Structured request logging with timing.
sanitize_string / sanitize_dict: Strip HTML/JS from user inputs (XSS prevention).
"""
import time
import uuid

import bleach
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Inject security headers on every HTTP response.
    Covers: clickjacking, MIME sniffing, XSS reflection, referrer leakage, permissions.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Legacy XSS filter (IE/old browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Limit browser feature access
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=()"
        )
        # Content Security Policy (restrictive baseline; relax per-route as needed)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self'; "
            "font-src 'self' data:; "
            "object-src 'none'; "
            "frame-ancestors 'none';"
        )
        # Disable caching for API responses
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
        response.headers["Pragma"] = "no-cache"

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Structured request logging: method, path, status, IP, duration, request-id.
    Assigns a unique X-Request-Id header to every request for tracing.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        # Attach request_id so route handlers can access it if needed
        request.state.request_id = request_id

        response: Response = await call_next(request)

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        client_ip = request.client.host if request.client else "unknown"

        # Add request ID to response header for client-side tracing
        response.headers["X-Request-Id"] = request_id

        # Structured log line
        print(
            f"[{request_id}] {request.method} {request.url.path} "
            f"→ {response.status_code} | {client_ip} | {duration_ms}ms"
        )

        return response


# ── Input Sanitization ──

ALLOWED_TAGS: list[str] = []  # strip ALL HTML tags
ALLOWED_ATTRS: dict = {}


def sanitize_string(value: str) -> str:
    """
    Strip all HTML and JavaScript from a string input.
    Protects against stored XSS attacks.
    """
    if not isinstance(value, str):
        return value
    return bleach.clean(value, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True).strip()


def sanitize_dict(data: dict) -> dict:
    """
    Recursively sanitize all string values in a dictionary.
    Safe to use on request bodies before persisting to DB.
    """
    sanitized: dict = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_string(v) if isinstance(v, str) else v for v in value
            ]
        else:
            sanitized[key] = value
    return sanitized
