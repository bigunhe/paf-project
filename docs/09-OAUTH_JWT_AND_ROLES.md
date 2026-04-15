# 09 — Google OAuth, JWT, and role-based access

This document describes how authentication works after the Member 4 OAuth + JWT work, how **ADMIN** vs **USER** is decided, and how to run it locally.

## How we know if someone is an admin

1. The user signs in with **Google** (OAuth2 code flow hosted by Spring Security).
2. The backend receives a verified **email** and Google **subject** (`sub`).
3. We look up the user in MongoDB **`users`** collection by **email** (source of truth).
4. The **`role`** field on that document is **`USER`** or **`ADMIN`** — not chosen by the client.
5. New Google users are created as **`USER`** by default. Promote someone to **`ADMIN`** by updating their document in MongoDB (or future admin tooling).

## Forced role reset policy (local profile bootstrap)

On backend startup with profile `local`, `DataSeeder` can enforce role policy:

1. Ensure seeded local users exist.
2. Reset every existing user to `USER`.
3. Promote only configured admin emails to `ADMIN`.

Config keys:

| Property | Meaning |
|----------|---------|
| `app.auth.reset-roles-on-startup` | If `true`, enforce role policy on startup. |
| `app.auth.admin-emails` | Comma-separated admin email list (e.g. `admin.itpm@gmail.com`). |

This prevents stale admin privileges from old test data.

## JWT

- After OAuth (or **dev-login** on profile `local`), the API issues a signed **JWT** containing `sub` (user id), `email`, and `role`.
- The SPA stores the token in **`sessionStorage`** under `smartcampus_token` and sends `Authorization: Bearer …` to `/api/v1/**`.
- API endpoints require a valid JWT except OAuth callbacks and **`GET /api/v1/auth/dev-login`** (local profile only).

## Environment variables

### Backend (`application.properties` or env)

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | HMAC key for JWT (min **32 characters**). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client (replace placeholders). |
| `FRONTEND_URL` | Redirect target after OAuth (default `http://localhost:5173`). |
| `SPRING_DATA_MONGODB_URI` | Mongo connection (often in `application-local.properties`). |
| `app.auth.reset-roles-on-startup` | Role policy bootstrap toggle (local). |
| `app.auth.admin-emails` | Admin email allowlist for bootstrap promotion. |

### Frontend

| Variable | Purpose |
|----------|---------|
| `VITE_API_ORIGIN` | Spring Boot base URL (default `http://localhost:8080`). Used for OAuth start URL and `/api/v1` base. |

Copy `frontend/.env.example` to `frontend/.env.local` and adjust if needed.

## Local development without Google (diagnostics only)

The UI remains Google-only. For backend diagnostics in profile `local`, you can still request:

```bash
GET /api/v1/auth/dev-login?as=user
GET /api/v1/auth/dev-login?as=admin
```

This endpoint is intended for troubleshooting and scripted checks, not as a user-facing login path.

## User-facing routes

- **`/`** — public home; primary action is **Sign in with Google**.
- **`/login`** — Google sign-in page.
- **`/auth/callback?token=…`** — OAuth redirect target; stores token and routes to **`/app`** or **`/admin`** by role.
- **`/app/**`** — requires authentication; **`USER`** and **`ADMIN`** can access (student experience).
- **`/admin/**`** — requires authentication and **`ADMIN`** role.
- Non-admins are redirected away from `/admin/**` by frontend guards and blocked by backend authorization.

## Viva talking points (short)

- **Why DB role?** Clients cannot be trusted to pick admin; role comes from persisted user record.
- **Why JWT?** Stateless API auth for SPA; can move to HttpOnly cookies later.
- **What is still manual?** Granting **ADMIN** in Mongo for staff accounts.

## Minimal user data for Smart Campus (recommended)

For this product (bookings + incidents + campus operations), keep only fields you actually need:

- **Required now**
  - `email` (identity and notifications target)
  - `name` (display in UI and admin screens)
  - `role` (`USER` / `ADMIN`)
  - `oauthProviderId` (stable link to Google account)
- **Optional (add only if needed)**
  - `phone` (urgent incident follow-up)
  - `department` or `faculty` (routing/reporting)
- **Not required for MVP**
  - `age`, demographics, or unrelated personal details

Principle: store the minimum data needed for campus workflows and security.
