# Running the MVP and how teammates plug in

## See it running live

You need **MongoDB** (see [MONGODB_SETUP.md](MONGODB_SETUP.md)), **`application-local.properties`** with your Atlas URI (gitignored), and the **`local` Spring profile** when running the backend.

**Terminal 1 — backend** (from repo root):

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Wait until you see **Tomcat started on port 8080** and **Started SmartCampusBackendApplication**. The log should show **`The following 1 profile is active: "local"`**.

**Terminal 2 — frontend:**

```bash
cd frontend
npm install   # first time only
npm run dev
```

**Browser:** open the URL Vite prints (usually **http://localhost:5173**). You land on **`/app`** (student dashboard) with nav for Browse, My bookings, Report issue, Account, and Login. Use the header **Staff portal** checkbox to switch to **`/admin`** (staff dashboard and operations nav).

**Quick API check** (optional, third terminal):

```bash
curl -s http://localhost:8080/api/v1/users
```

---

## What is implemented already (one monorepo, not separate silos)

The app is **one** Spring Boot API under **`/api/v1`** and **one** React SPA. Auth, notifications, core (exceptions, CORS, security seeding), facilities, bookings, and maintenance live in the **same** codebase — same server, same axios `baseURL` in `frontend/src/features/core/api.js`.

### Frontend routes (`frontend/src/features/core/App.jsx`)

Student portal **`/app/*`** and staff portal **`/admin/*`** share the same backend; each member (1–3) implements **both** surfaces for their domain on the same collections and REST paths.

| Path | Owner area | Purpose |
|------|------------|---------|
| `/` | core | Redirect → `/app` |
| `/app` | core | Student dashboard (cards / links) |
| `/app/resources` | facilities | Browse spaces & equipment (Member 1) |
| `/app/bookings` | bookings | My bookings / request flow (Member 2) |
| `/app/report` | maintenance | Report a problem (Member 3; user-facing copy) |
| `/app/account` | auth | Account stub (Member 4) |
| `/admin` | core | Staff dashboard |
| `/admin/resources` | facilities | Manage resource catalogue (Member 1) |
| `/admin/bookings` | bookings | Booking approvals (Member 2) |
| `/admin/incidents` | maintenance | Incident / ticket console (Member 3) |
| `/admin/users` | auth | Users MVP placeholder (Member 4) |
| `/login` | auth | Login placeholder (OAuth later) |

**Legacy redirects:** `/resources` → `/app/resources`, `/bookings` → `/app/bookings`, `/tickets` → `/app/report`.

Nav + **AuthContext** (URL-derived `isAdmin` / user id; **Staff portal** checkbox navigates `/app` ↔ `/admin`) + **NotificationDropdown** live in `frontend/src/features/core/Layout.jsx`.

### Backend REST surface (all under `/api/v1`)

- **Users:** `GET /users`, `GET /users/{id}` — `backend/src/main/java/com/smartcampus/auth/UserController.java`
- **Notifications:** `GET /notifications?userId=`, `PATCH /notifications/{id}/read` — `backend/src/main/java/com/smartcampus/notifications/NotificationController.java`
- **Resources:** `GET/POST /resources`, `GET/DELETE /resources/{id}` — `backend/src/main/java/com/smartcampus/facilities/ResourceController.java`
- **Bookings:** `GET/POST /bookings`, `PATCH /bookings/{id}/status` — `backend/src/main/java/com/smartcampus/bookings/BookingController.java`
- **Tickets:** `GET/POST /tickets`, `GET /tickets/{id}`, `PATCH /tickets/{id}/status`, `PATCH /tickets/{id}/assignment`, `POST /tickets/{id}/comments` — `backend/src/main/java/com/smartcampus/maintenance/TicketController.java`

These routes already exist; members refine logic, DTOs, validation, and UI inside their feature packages per [03-BACKEND_API_RULES.md](03-BACKEND_API_RULES.md) and [04-GIT_AND_WORKFLOW.md](04-GIT_AND_WORKFLOW.md).

```mermaid
flowchart LR
  subgraph fe [React_Vite]
    pages[feature_pages]
    api[core_api.js]
  end
  subgraph be [Spring_Boot]
    ctrl[REST_controllers]
    svc[services]
    mongo[(MongoDB)]
  end
  pages --> api
  api -->|"localhost:8080 api v1"| ctrl
  ctrl --> svc
  svc --> mongo
```

---

## How other members blend in

1. **Same repo, same conventions:** Work in `backend/src/main/java/com/smartcampus/{facilities|bookings|maintenance|auth|notifications}/` and `frontend/src/features/{...}/`.
2. **Extend, do not fork:** Keep adding behavior under the same `/api/v1/...` naming rules (plural resources, PATCH for status where applicable).
3. **Cross-domain hooks:** Booking approval and ticket status updates call **NotificationService** so notifications stay in the notifications module.
4. **Danger zone** (coordinate before bulk edits): `frontend/src/features/core/App.jsx` (new `<Route>` lines), `frontend/package.json`, `backend/pom.xml`, `backend/src/main/resources/application.properties`.

**After pulling `main`:** create `feat/m1-facilities` (etc.), add your own **local-only** `application-local.properties`, run backend with **profile `local`**, run `npm run dev`, then iterate in **your** feature folders and open PRs.

See also [TEAM_HANDOFF.md](TEAM_HANDOFF.md).
