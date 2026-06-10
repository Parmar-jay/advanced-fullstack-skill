"""
Application settings — loaded from .env via pydantic-settings.
All environment variable names are case-insensitive.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # ── Database ──
    mongodb_uri: str = "mongodb://localhost:27017"
    db_name: str = "myapp"

    # ── JWT ──
    jwt_secret: str = "dev-secret-change-me-in-production"
    jwt_refresh_secret: str = "dev-refresh-secret-change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # ── CORS ──
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # ── Google OAuth ──
    google_client_id: str = ""
    google_client_secret: str = ""

    # ── SMTP ──
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_name: str = "MyApp"
    smtp_from_email: str = "noreply@myapp.com"

    # ── OTP ──
    otp_expiry_minutes: int = 10
    otp_max_attempts: int = 5
    otp_cooldown_seconds: int = 60

    # ── Security ──
    max_login_attempts: int = 5
    login_lockout_minutes: int = 15

    # ── Cloudinary (optional) ──
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    # ── App ──
    app_name: str = "MyApp"
    app_env: str = "development"
    debug: bool = True

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
