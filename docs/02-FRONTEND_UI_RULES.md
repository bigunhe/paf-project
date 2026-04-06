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
**Standardized Paths:**
* `/` -> Dashboard (Shared Overview)
* `/login` -> Auth (Member 4)
* `/resources` -> Facilities Catalogue (Member 1)
* `/bookings` -> User Bookings & Admin Approvals (Member 2)
* `/tickets` -> Maintenance Incidents (Member 3)

## 5. State Management & API Calls
* **API Client:** Use `axios`. Set the base URL to `http://localhost:8080/api/v1`.
* **No Redux:** For this MVP, avoid Redux to save time. Use React Context API only for global states like Auth and Notifications. Pass data via props for local component state.
* **Auth Bypass (Development Mode):** Until Member 4 finishes the OAuth integration, temporarily hardcode a user object in the frontend API calls (e.g., `const currentUserId = "64a1b9..."`) so Members 1, 2, and 3 can test their POST requests without getting `401 Unauthorized` errors.