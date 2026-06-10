# 🚀 Fullstack Python Skill

A production-grade, security-first fullstack web app scaffold powered by **FastAPI + MongoDB + React + Vite**.

Import this skill into any coding agent to instantly have the capability to build secure, full-featured web applications.

## Features

- ✅ JWT Authentication (access + refresh token rotation)
- ✅ Email/OTP Registration with verification
- ✅ Google OAuth 2.0
- ✅ Forgot Password with OTP flow
- ✅ Role-based access control (customer / admin / manager)
- ✅ Brute-force protection & account lockout
- ✅ Security headers (CSP, X-Frame-Options, HSTS-ready)
- ✅ Input sanitization (XSS prevention via bleach)
- ✅ Rate limiting (SlowAPI)
- ✅ File uploads (Cloudinary)
- ✅ Async email (aiosmtplib)
- ✅ MongoDB with proper indexes
- ✅ Admin dashboard routes
- ✅ Generic CRUD pattern (Items)
- ✅ React + Vite frontend with auth context
- ✅ Axios interceptors for auto token refresh
- ✅ Protected & admin routes
- ✅ Docker Compose support

## Quick Start

```bash
# Backend
cd backend && pip install -r requirements.txt
cp .env.example .env  # fill in your values
uvicorn main:app --reload

# Frontend
cd frontend && npm install
cp .env.example .env
npm run dev
```

## Skill Usage

See [SKILL.md](./SKILL.md) for full agent instructions on architecture, conventions, and how to extend.
