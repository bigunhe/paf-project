# 02 - FRONTEND UI AND ARCHITECTURE RULES

## 1. Tech Stack & Core Rules
* **Framework:** React (via Vite)
* **Routing:** `react-router-dom` (v6+)
* **Styling:** Tailwind CSS ONLY.
* **Strict Constraint:** DO NOT create any `.css` or `.scss` files (except the base `index.css` for Tailwind imports). All styling must be done via inline Tailwind utility classes.
* **Components:** Use functional components and React Hooks (`useState`, `useEffect`). No class components.

## 2. Directory Structure Boundaries
Developers must strictly work within their assigned feature folders inside `/src/features/`.
* `core/`: Global UI (Navbar, Sidebar, Page Layout wrapper, Axios instance).
* `facilities/`: Member 1 components (Resource tables, Add Resource forms).
* `bookings/`: Member 2 components (Booking calendar/list, Request modals).
* `maintenance/`: Member 3 components (Ticket boards, Image upload handlers).
* `auth/` & `notifications/`: Member 4 components (Login screen, Notification dropdown).

## 3. Global Styling & Color Palette (The MVP Theme)
To ensure the app looks cohesive, stick strictly to this Tailwind color palette:
* **Backgrounds:** `bg-slate-50` for main app background, `bg-white` for cards/panels.
* **Text:** `text-slate-900` for primary headings, `text-slate-500` for secondary text.
* **Primary Actions (Save/Submit/Create):** `bg-blue-600 hover:bg-blue-700 text-white`.
* **Destructive Actions (Delete/Cancel/Reject):** `bg-red-500 hover:bg-red-600 text-white`.
* **Success Actions (Approve/Resolve):** `bg-emerald-500 hover:bg-emerald-600 text-white`.
* **Borders & Dividers:** `border-slate-200`.
* **Layout:** Use standard Flexbox or CSS Grid for all layouts. Keep forms centered and tables full-width with a light shadow (`shadow-sm`, `rounded-lg`).

## 4. Routing Architecture (`App.jsx`)
All routes must be centralized in `src/features/core/App.jsx` (root `src/App.jsx` re-exports this file).

**Student portal (`/app/*`)** — end-user journeys (browse, request, report, account):

* `/app` → Student dashboard (`UserDashboardPage`)
* `/app/resources` → Browse catalogue (Member 1 user surface)
* `/app/bookings` → My bookings (Member 2 user surface)
* `/app/report` → Report a problem / incidents as student (Member 3 user surface; avoid “Maintenance” in labels)
* `/app/account` → Account stub (Member 4; links to login)

**Staff portal (`/admin/*`)** — operations / management:

* `/admin` → Staff dashboard (`AdminDashboardPage`)
* `/admin/resources` → Manage catalogue (Member 1 admin surface)
* `/admin/bookings` → Booking approvals (Member 2 admin surface)
* `/admin/incidents` → Incident console (Member 3 admin surface; same tickets API as `/app/report`)
* `/admin/users` → User directory from `GET /api/v1/users` (Member 4)

**Global:**

* `/` → Public home (`HomePage`); primary sign-in is Google OAuth (see [09-OAUTH_JWT_AND_ROLES.md](09-OAUTH_JWT_AND_ROLES.md))
* `/login` → Sign-in (Member 4); UI exposes **Google-only** login
* `/auth/callback` → OAuth redirect handler (stores JWT, then routes by role)

**Legacy redirects** (bookmarks): `/resources` → `/app/resources`, `/bookings` → `/app/bookings`, `/tickets` → `/app/report`.

**Not found:** Unknown routes render `NotFoundPage` (still inside `Layout`).

**Auth:** JWT in `sessionStorage` (`smartcampus_token`); `GET /api/v1/auth/me` loads the current user. Role **`USER` vs `ADMIN`** comes from the database, not from the URL. **`/app/*`** requires a signed-in user; **`/admin/*`** requires **`ADMIN`**. Admins switch between student and staff areas via header links.

**Ownership:** Members 1–3 each own **both** the student and staff route for their domain against the **same** MongoDB collections and `/api/v1/...` contracts (see [01-BUSINESS_AND_DATA_MODEL.md](01-BUSINESS_AND_DATA_MODEL.md)). Full file map and backlog: [06-TEAM_OWNERSHIP_AND_STATUS.md](06-TEAM_OWNERSHIP_AND_STATUS.md).

## 5. State Management & API Calls
* **API Client:** Use `axios` via `src/features/core/api.js`. Base URL is `${VITE_API_ORIGIN}/api/v1` (default `http://localhost:8080/api/v1`). The client attaches `Authorization: Bearer` from `sessionStorage` when a JWT is present.
* **No Redux:** For this MVP, avoid Redux to save time. Use React Context API only for global states like Auth and Notifications. Pass data via props for local component state.
* **Local dev without Google:** UI remains Google-only; for diagnostics only, backend profile `local` exposes `GET /api/v1/auth/dev-login` (see [09-OAUTH_JWT_AND_ROLES.md](09-OAUTH_JWT_AND_ROLES.md)).