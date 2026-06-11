---
name: fullstack-python-skill
description: "Production-grade fullstack scaffold: FastAPI + MongoDB + React + Vite with JWT auth, OAuth, role-based access, and security hardening."
---

# 🧠 Fullstack Python Skill — Coding Agent Instruction File

## Overview
This skill enables any coding agent to scaffold, build, and extend a production-grade fullstack web application using:
- **Backend**: FastAPI + MongoDB (Motor) + Python 3.11+
- **Frontend**: React 18 + Vite + Vanilla CSS (no Tailwind)
- **Auth**: JWT (access + refresh tokens), OTP email verification, Google OAuth
- **Security**: bcrypt hashing, rate limiting (SlowAPI), CSRF-safe headers, XSS sanitization, brute-force protection, HTTPS-ready

---

## Stack & Conventions

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| ASGI Server | Uvicorn |
| Database | MongoDB via Motor (async) |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Validation | Pydantic v2 |
| Email | aiosmtplib (async SMTP) |
| Rate limiting | slowapi + limits |
| Input sanitization | bleach |
| File uploads | python-multipart + Cloudinary |
| Settings | pydantic-settings (`.env`) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Bundler | Vite |
| Routing | react-router-dom v6 |
| HTTP | axios (with interceptors for token refresh) |
| State | React Context API |
| Styling | Tailwind CSS & CSS (Styled according to "UI UX Pro Max" skill guidelines) |
| Animations | GSAP (Core, ScrollTrigger, Timeline) & CSS transitions (Configured via `@gsap/react`) |

---

## Folder Structure

```
project-root/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, middleware, routers
│   ├── database.py                # Motor client, collection refs, index creation
│   ├── requirements.txt
│   ├── .env.example
│   ├── core/
│   │   ├── config.py              # pydantic-settings (reads .env)
│   │   ├── security.py            # hashing, JWT, OTP helpers
│   │   ├── deps.py                # FastAPI dependency injection (auth guards)
│   │   ├── middleware.py          # SecurityHeaders, RequestLogging, sanitize helpers
│   │   └── email.py               # async SMTP email sender
│   ├── models/
│   │   └── schemas.py             # Pydantic schemas for all domains
│   └── routers/
│       ├── auth.py                # signup, verify, login, refresh, logout, google, OTP, reset
│       ├── users.py               # /me GET/PUT, change password, delete account
│       ├── items.py               # generic CRUD example (replace with your domain)
│       ├── admin.py               # admin-only routes (user management, stats)
│       └── uploads.py             # file upload to Cloudinary
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   ├── axios.js           # axios instance + interceptors (auto token refresh)
│       │   └── endpoints.js       # all API call functions
│       ├── context/
│       │   └── AuthContext.jsx    # global auth state (user, login, logout)
│       ├── hooks/
│       │   └── useAuth.js         # convenience hook
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   ├── AdminRoute.jsx
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── LoadingSpinner.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── VerifyEmail.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Profile.jsx
│       │   ├── Admin.jsx
│       │   └── NotFound.jsx
│       └── styles/
│           └── index.css
└── docker-compose.yml
```

---

## Security Features Implemented

| Attack | Mitigation |
|---|---|
| SQL/NoSQL Injection | Pydantic validation + parameterized queries (Motor) |
| XSS | bleach sanitization on all string inputs |
| CSRF | SameSite cookies + CORS allowlist |
| Brute Force | Account lockout (5 attempts → 15 min cooldown) |
| Token Theft | Short-lived access tokens (15 min) + rotating refresh tokens |
| Password Weak | Strength validator (uppercase + lowercase + digit) |
| Enumeration | Constant-time responses for forgot-password |
| Clickjacking | `X-Frame-Options: DENY` header |
| MIME Sniffing | `X-Content-Type-Options: nosniff` header |
| Sensitive data in URL | Tokens always in Authorization header |
| Stale sessions | Refresh token rotation + revoke-all on password reset |

---

## Auth Flow

### Registration
1. `POST /auth/signup` → stores pending signup + sends OTP email
2. `POST /auth/signup/verify` → verifies OTP → creates user → returns JWT pair
3. `POST /auth/signup/resend-otp` → resend with cooldown

### Login
1. `POST /auth/login` → verifies password → returns JWT access + refresh tokens
2. `POST /auth/refresh` → rotates refresh token
3. `POST /auth/logout` → revokes all refresh tokens

### Password Reset
1. `POST /auth/forgot-password` → sends OTP (always returns 200 to prevent enumeration)
2. `POST /auth/verify-otp` → verifies OTP without consuming it
3. `POST /auth/reset-password` → verifies OTP + resets password + revokes all sessions

### Google OAuth
1. `POST /auth/google` → accepts Google ID token → verifies with Google API → creates/updates user

---

## Environment Variables

### Backend `.env`
```
MONGODB_URI=mongodb://localhost:27017
DB_NAME=myapp

JWT_SECRET=change-this-32char-minimum-secret
JWT_REFRESH_SECRET=change-this-different-refresh-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

CORS_ORIGINS=http://localhost:5173,https://yourdomain.com

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=MyApp
SMTP_FROM_EMAIL=noreply@myapp.com

OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_COOLDOWN_SECONDS=60

MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_MINUTES=15

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## Adding New Features (Agent Instructions)

### Add a new resource (e.g., "Posts")
1. Add Pydantic schemas to `backend/models/schemas.py`
2. Create `backend/routers/posts.py` with CRUD endpoints
3. Register the router in `backend/main.py`
4. Add DB indexes in `backend/database.py → create_indexes()`
5. Add API functions to `frontend/src/api/endpoints.js`
6. Create page components in `frontend/src/pages/`
7. Add routes in `frontend/src/App.jsx`

### Role-based access
- Use `Depends(get_current_user)` for authenticated routes
- Use `Depends(require_admin)` for admin-only routes
- Use `Depends(require_role("manager", "admin"))` for multi-role access

### UI/UX & Frontend Styling (Coexistence with "UI UX Pro Max" Skill)
To ensure styling, layout, positioning, and animation changes do not interfere with functional development or break responsiveness:
- **Tailwind CSS Utility Classes**: Use Tailwind CSS utility classes exclusively for all layout structures, margins, paddings, flexing, and colors. Do not write custom CSS in `frontend/src/styles/index.css` unless defining theme extensions or base animations.
- **GSAP Animations**: Use GSAP (Core, Timeline, ScrollTrigger) paired with `@gsap/react`'s `useGSAP` hook for all interactive element animations, scroll-linked movements, parallax, and entry timelines. Never use raw `useEffect` blocks for GSAP to avoid memory leaks.
- **Theme and Branding Constraints**: Adhere to the design system tokens, typography pairing configurations (display/serif/sans), and color modes defined in [UI_UX_PRO_MAX_SKILL.md](file:///d:/fullstack-python-skill/UI_UX_PRO_MAX_SKILL.md).
- **Asset Acquisition**: Retrieve high-fidelity visual context/theme-appropriate images from Unsplash or write premium inline SVGs using the curated list of fallback assets in the [UI_UX_PRO_MAX_SKILL.md](file:///d:/fullstack-python-skill/UI_UX_PRO_MAX_SKILL.md) handbook.
- **Design Hand-off & Separation of Concerns**: Coding agents implementing core logic should structure React components with clean Tailwind containers and layout classes. If a component requires premium styling or animations, refer to the [UI_UX_PRO_MAX_SKILL.md](file:///d:/fullstack-python-skill/UI_UX_PRO_MAX_SKILL.md) instructions to refine the visual presentation, transitions, and mouse coordinates.

---

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker (full stack)
```bash
docker-compose up --build
```

---

## API Docs
When backend is running: http://localhost:8000/docs (Swagger UI)
