"""
Async email sender — uses aiosmtplib with HTML templates.

All emails are sent asynchronously so they never block the request cycle.
In development (when SMTP credentials are not configured) emails are skipped
and OTPs are printed to stdout.
"""
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

import aiosmtplib

from core.config import settings


# ── Helpers ──

def _make_message(to: str, subject: str, html: str, plain: str) -> MIMEMultipart:
    """Build a MIMEMultipart email message."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))
    return msg


async def _send(to: str, subject: str, html: str, plain: str) -> bool:
    """
    Send an email. Returns True on success, False on failure.
    If SMTP is not configured (empty user/password), skips silently.
    """
    if not settings.smtp_user or not settings.smtp_password:
        print(f"[EMAIL] SMTP not configured. Would send to {to}: {subject}")
        return False

    msg = _make_message(to, subject, html, plain)
    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
        print(f"[EMAIL] Sent '{subject}' to {to}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to}: {e}")
        return False


# ══════════════════════════════════════════════
#  EMAIL TEMPLATES
# ══════════════════════════════════════════════

def _base_html(content: str, app_name: str = None) -> str:
    """Wrap content in a consistent HTML email shell."""
    name = app_name or settings.app_name
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5; margin: 0; padding: 0; }}
    .container {{ max-width: 560px; margin: 40px auto; background: #fff;
                 border-radius: 8px; overflow: hidden;
                 box-shadow: 0 2px 8px rgba(0,0,0,.08); }}
    .header {{ background: #1a1a2e; padding: 32px 40px; text-align: center; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 22px; font-weight: 600; }}
    .body {{ padding: 40px; color: #333; line-height: 1.6; }}
    .otp-box {{ background: #f0f4ff; border: 2px dashed #4f6ef7;
                border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0; }}
    .otp-code {{ font-size: 36px; font-weight: 700; letter-spacing: 8px;
                 color: #1a1a2e; font-family: monospace; }}
    .expires {{ font-size: 12px; color: #888; margin-top: 8px; }}
    .footer {{ padding: 20px 40px; border-top: 1px solid #eee;
               font-size: 12px; color: #999; text-align: center; }}
    .btn {{ display: inline-block; background: #4f6ef7; color: #fff;
            padding: 12px 32px; border-radius: 6px; text-decoration: none;
            font-weight: 600; margin: 16px 0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>{name}</h1></div>
    <div class="body">{content}</div>
    <div class="footer">
      This email was sent by {name}. If you did not request this, please ignore it.
    </div>
  </div>
</body>
</html>
"""


# ══════════════════════════════════════════════
#  SIGNUP OTP
# ══════════════════════════════════════════════

async def send_signup_otp_email(to: str, otp: str, name: str = "") -> bool:
    """Send email verification OTP during signup."""
    greeting = f"Hi {name}," if name else "Hi there,"
    html = _base_html(f"""
        <p>{greeting}</p>
        <p>Thanks for signing up! Please verify your email address using the code below:</p>
        <div class="otp-box">
          <div class="otp-code">{otp}</div>
          <div class="expires">Expires in {settings.otp_expiry_minutes} minutes</div>
        </div>
        <p>If you didn't create an account, you can safely ignore this email.</p>
    """)
    plain = f"{greeting}\n\nYour verification code is: {otp}\n\nExpires in {settings.otp_expiry_minutes} minutes."
    return await _send(to, f"Verify your {settings.app_name} account", html, plain)


# ══════════════════════════════════════════════
#  PASSWORD RESET OTP
# ══════════════════════════════════════════════

async def send_password_reset_otp_email(to: str, otp: str, name: str = "") -> bool:
    """Send password reset OTP."""
    greeting = f"Hi {name}," if name else "Hi there,"
    html = _base_html(f"""
        <p>{greeting}</p>
        <p>We received a request to reset your password. Use the code below:</p>
        <div class="otp-box">
          <div class="otp-code">{otp}</div>
          <div class="expires">Expires in {settings.otp_expiry_minutes} minutes</div>
        </div>
        <p><strong>If you didn't request this, please change your password immediately.</strong></p>
    """)
    plain = f"{greeting}\n\nYour password reset code is: {otp}\n\nExpires in {settings.otp_expiry_minutes} minutes."
    return await _send(to, f"Reset your {settings.app_name} password", html, plain)


# ══════════════════════════════════════════════
#  WELCOME EMAIL
# ══════════════════════════════════════════════

async def send_welcome_email(to: str, name: str = "") -> bool:
    """Send welcome email after successful registration."""
    greeting = f"Welcome, {name}!" if name else "Welcome!"
    html = _base_html(f"""
        <h2>{greeting}</h2>
        <p>Your account has been created and verified successfully.</p>
        <p>You can now log in and start using {settings.app_name}.</p>
    """)
    plain = f"{greeting}\n\nYour {settings.app_name} account is ready. Welcome aboard!"
    return await _send(to, f"Welcome to {settings.app_name}!", html, plain)


# ══════════════════════════════════════════════
#  PASSWORD CHANGED NOTIFICATION
# ══════════════════════════════════════════════

async def send_password_changed_email(to: str, name: str = "") -> bool:
    """Notify user that their password was changed."""
    greeting = f"Hi {name}," if name else "Hi there,"
    html = _base_html(f"""
        <p>{greeting}</p>
        <p>Your password was successfully changed.</p>
        <p>If you did not make this change, please contact support immediately or reset your password.</p>
    """)
    plain = f"{greeting}\n\nYour {settings.app_name} password was changed. If this wasn't you, contact support immediately."
    return await _send(to, f"Your {settings.app_name} password was changed", html, plain)
