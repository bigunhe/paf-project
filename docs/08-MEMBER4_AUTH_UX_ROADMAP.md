# 08 — Member 4: auth, UX entry, and phased delivery (ultimate roadmap)

This document is the **single source of truth** for Member 4’s remaining work. Implement **one phase at a time** with **atomic commits** (one concern per commit). Do not merge routing, OAuth backend, and visual polish in the same commit.

**Related:** [02-FRONTEND_UI_RULES.md](02-FRONTEND_UI_RULES.md), [06-TEAM_OWNERSHIP_AND_STATUS.md](06-TEAM_OWNERSHIP_AND_STATUS.md), [03-BACKEND_API_RULES.md](03-BACKEND_API_RULES.md).

---

## 1. Member 4 — sub-functions (what you own)

| Sub-function | Current MVP state | Target state |
|--------------|-------------------|--------------|
| **Identity** | Dev user id from `/app` vs `/admin` URL; `AuthContext` + `constants.js` | Google OAuth (or session/JWT); real `userId` and role from backend |
| **Access control** | `SecurityConfig`: permit-all | Role-based rules: `USER` vs `ADMIN` on sensitive APIs and UI entry |
| **Entry UX** | `/` redirects to `/app` (dashboard-first) | Public **home** at `/`; dashboards only after sign-in |
| **Login UX** | `/login` stub; “Staff portal” checkbox for dev | Primary CTA: **Sign in with Google**; staff/student routing after auth |
| **Notifications** | List + mark read; M2/M3 create notifications via `NotificationService` | Same flows; identity for `userId` comes from auth, not dev constants only |
| **Users (admin)** | `/admin/users` lists `GET /users` | Same + real admin-only access when security is tightened |
| **Team enablement** | Windows setup, ownership doc | Keep docs updated as auth behavior changes |

---

## 2. Baseline narrative (2-minute version)

**Today:** The app is built so all members could work in parallel: the UI picks a **dev** student or admin id based on whether you are under `/app` or `/admin`. The API is open. Notifications and users endpoints work. There is **no real Google login session** yet.

**Next:** Add a **public home**, then **route guards**, then **role-based redirects**, then **OAuth** end-to-end, then **polish** and a short **viva script**. Each step is a small commit.

---

## 3. OAuth + dev fallback (staging rule)

**Requirement:** Real OAuth must not block the team during development.

**Policy (to implement in Phase 4, designed here in Phase 0):**

1. **When OAuth is configured** (e.g. Google client id/secret present in local env or `application-local.properties` — never commit secrets):  
   - User signs in with Google; backend establishes session or returns token; frontend stores auth state and uses real `userId` / role.

2. **When OAuth is not configured:**  
   - App keeps a **documented dev mode**: e.g. explicit “Continue as dev student / dev admin” or existing Staff portal behavior **only behind a clear dev flag** (e.g. `import.meta.env.DEV` or `VITE_AUTH_DEV_FALLBACK=true`), so production builds do not accidentally ship open impersonation.

3. **Single source of role for redirects:**  
   - After Phase 3+, redirect targets (`/app` vs `/admin`) must follow **one** rule: authenticated role from backend (or dev fallback state), not ad-hoc URL guessing alone.

Document the chosen flags and env names in [02-FRONTEND_UI_RULES.md](02-FRONTEND_UI_RULES.md) when Phase 4 lands.

---

## 4. Phases — goals, acceptance criteria, atomic commits

### Phase 0 — Baseline freeze (this document)

| Item | Detail |
|------|--------|
| **Goal** | Lock scope, acceptance criteria, and commit discipline before feature code. |
| **Acceptance criteria** | (1) This file exists in `docs/`. (2) Phases 1–6 each have testable exit criteria below. (3) OAuth staging + dev fallback policy is written. (4) Team handoff points to this doc. |
| **Atomic commits** | `docs: add Member 4 auth/UX phased roadmap (phase 0)` |
| **Exit** | Anyone can pick “Phase N” and know exactly what “done” means. |

---

### Phase 1 — Public home (no OAuth backend yet)

| Item | Detail |
|------|--------|
| **Goal** | First screen is a **marketing-style home**, not the student dashboard. |
| **Acceptance criteria** | (1) `/` renders a dedicated `HomePage` (or equivalent). (2) Clear CTAs to `/login` (and optional links to features). (3) `/app` and `/admin` still reachable for current dev workflow until Phase 2 guards land. |
| **Atomic commits** | (1) `feat(ui): add public home page with auth CTAs` (2) `feat(routing): use / as home; adjust entry redirects` |
| **Exit** | New user opening `localhost` sees home, not dashboard grid. |

---

### Phase 2 — Auth state + route guards (dev fallback still OK)

| Item | Detail |
|------|--------|
| **Goal** | Explicit **authenticated vs unauthenticated** state; protect `/app/*` and `/admin/*`. |
| **Acceptance criteria** | (1) Unauthenticated user hitting `/app/...` or `/admin/...` is redirected to `/login` or `/` per agreed rule. (2) Dev fallback path still allows local testing without OAuth (documented). (3) No broken loops (redirect ping-pong). |
| **Atomic commits** | (1) `feat(auth): add auth state contract + provider shape` (2) `feat(routing): add ProtectedRoute for app and admin trees` |
| **Exit** | Dashboards behave as “logged-in area”; home/login behave as public. |

---

### Phase 3 — Role-based redirects

| Item | Detail |
|------|--------|
| **Goal** | After successful login (or dev sign-in), **USER → `/app`**, **ADMIN → `/admin`**. |
| **Acceptance criteria** | (1) Same login success path branches on role. (2) ADMIN cannot be silently dropped on student-only home unless intentional. (3) Manual URL to wrong portal handled (redirect or 403 UX) — pick one and document in Phase 3 PR. |
| **Atomic commits** | (1) `feat(auth): add post-login redirect helper from role` (2) `feat(login): wire redirect after sign-in success` |
| **Exit** | Two test accounts (or dev toggles) prove both redirects. |

---

### Phase 4 — Google OAuth (backend + frontend)

| Item | Detail |
|------|--------|
| **Goal** | Real **Sign in with Google**; session or token; map to `users` collection / role. |
| **Acceptance criteria** | (1) OAuth login completes without console errors. (2) Backend receives identity and responds consistently with frontend expectations. (3) Dev fallback remains available when credentials absent. (4) Secrets only in env / `application-local.properties` (gitignored). |
| **Atomic commits** | (1) `feat(security): oauth2 login and callback endpoints` (2) `feat(auth): frontend oauth start + callback route` (3) `feat(auth): map oauth user to app userId and role` |
| **Exit** | Examiner can watch a real Google sign-in demo (or video) with clear explanation. |

---

### Phase 5 — UX polish (bounded)

| Item | Detail |
|------|--------|
| **Goal** | Cohesive look: home hero, auth pages, header for public vs authenticated shells. |
| **Acceptance criteria** | (1) Tailwind-only, matches palette in doc 02. (2) Responsive layout for home and login on narrow widths. (3) Loading/empty states on login and notifications where applicable. |
| **Atomic commits** | (1) `style(ui): polish public home and login` (2) `style(ui): align layout shell for authenticated routes` |
| **Exit** | UI feels intentional, not default-table MVP. |

---

### Phase 6 — Viva pack

| Item | Detail |
|------|--------|
| **Goal** | Short, exam-ready explanation without memorizing every file. |
| **Acceptance criteria** | (1) New doc section or `docs/09-...` with 90s + 3min scripts and Q&A table. (2) “Done vs pending” aligned with this roadmap. |
| **Atomic commits** | `docs(viva): Member 4 talking points and demo checklist` |
| **Exit** | You can demo home → login → role redirect → notification in one flow. |

---

## 5. Validation checklist (after any phase)

- [ ] `npm run build` (frontend) passes.
- [ ] `./mvnw compile` (backend) passes if backend touched.
- [ ] Manual smoke: `/`, `/login`, `/app`, `/admin`, one API call (`/users` or `/notifications`).
- [ ] No secrets committed.

---

## 6. Dependency order (do not skip)

```text
Phase 0 (this doc)
  → Phase 1 (home)
  → Phase 2 (guards)
  → Phase 3 (redirects)
  → Phase 4 (OAuth)
  → Phase 5 (polish)
  → Phase 6 (viva)
```

Phases 3 and 4 can be split further if OAuth takes multiple PRs; keep redirects working on **dev** identity before swapping to Google-only.

---

## 7. What “ultimate” means here

- **Ultimate plan** = this document: phases, acceptance criteria, commit granularity, OAuth staging, and order of work.
- Execution is **never** “the whole plan at once”; it is **phase-by-phase** with the commits listed above.

When Phase 1 starts, say explicitly: **“Implement Phase 1 only.”**
