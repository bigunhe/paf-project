# Team handoff — Smart Campus Operations Hub (MVP baseline)

Copy or adapt the block below for Slack, email, or your LMS.

---

**Repository:** https://github.com/bigunhe/paf-project.git  

**Branches (do not commit directly to `main`):**

| Member | Branch |
|--------|--------|
| Member 1 – Facilities | `feat/m1-facilities` |
| Member 2 – Bookings | `feat/m2-bookings` |
| Member 3 – Maintenance | `feat/m3-maintenance` |
| Member 4 – Auth & notifications | `feat/m4-auth` |

Daily: pull latest `main`, merge into your feature branch, push your branch, open a **Pull Request** for the lead to merge.

**Run locally**

1. **MongoDB** — required. See [MONGODB_SETUP.md](MONGODB_SETUP.md). Add **`backend/src/main/resources/application-local.properties`** with `spring.data.mongodb.uri=...` (file is gitignored — do not commit secrets).
2. **Backend:** `cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local`
3. **Frontend:** `cd frontend && npm install && npm run dev`

**Full run guide + how domains plug together:** [05-RUNNING_AND_TEAM_INTEGRATION.md](05-RUNNING_AND_TEAM_INTEGRATION.md). **Windows (PowerShell):** [07-WINDOWS_LOCAL_SETUP.md](07-WINDOWS_LOCAL_SETUP.md).

**Docs:** API and packaging rules in [03-BACKEND_API_RULES.md](03-BACKEND_API_RULES.md), UI and routes in [02-FRONTEND_UI_RULES.md](02-FRONTEND_UI_RULES.md), data shapes in [01-BUSINESS_AND_DATA_MODEL.md](01-BUSINESS_AND_DATA_MODEL.md), Git workflow in [04-GIT_AND_WORKFLOW.md](04-GIT_AND_WORKFLOW.md), team ownership map in [06-TEAM_OWNERSHIP_AND_STATUS.md](06-TEAM_OWNERSHIP_AND_STATUS.md). **Member 4 phased roadmap (auth, home, OAuth):** [08-MEMBER4_AUTH_UX_ROADMAP.md](08-MEMBER4_AUTH_UX_ROADMAP.md). **OAuth + JWT + roles:** [09-OAUTH_JWT_AND_ROLES.md](09-OAUTH_JWT_AND_ROLES.md).

**API base URL:** `http://localhost:8080/api/v1` — central router in `frontend/src/features/core/App.jsx`.

**Auth:** Google OAuth + JWT — see [09-OAUTH_JWT_AND_ROLES.md](09-OAUTH_JWT_AND_ROLES.md). UI is Google-only; local profile still exposes `GET /api/v1/auth/dev-login` for diagnostics.

---

## Open a Pull Request

1. Push your branch: `git push -u origin feat/m4-auth` (or your member branch).
2. On GitHub: compare against `main` and open a PR.
3. After merge, everyone runs `git checkout main && git pull origin main` and merges `main` back into their feature branch.
