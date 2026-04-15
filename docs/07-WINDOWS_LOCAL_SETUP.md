# Windows — local setup and run (Smart Campus Hub)

This guide is for teammates on **Windows** who already have **Java** and **Node.js** installed. It explains exactly what to run in PowerShell and where to put your **MongoDB connection string** so the backend can start against Atlas (recommended) or a local MongoDB instance.

**Related docs:** [MONGODB_SETUP.md](MONGODB_SETUP.md) (Atlas vs local overview), [05-RUNNING_AND_TEAM_INTEGRATION.md](05-RUNNING_AND_TEAM_INTEGRATION.md) (macOS/Linux-style commands and architecture).

---

## 1. What you need

| Requirement | Notes |
|-------------|--------|
| **Git** | Clone and pull the `development` branch from GitHub. |
| **Java JDK** | Java **17 or 21** is typical for Spring Boot 3.x. You said it is already installed. |
| **Node.js + npm** | **Node 18+** (20 LTS is fine). You said it is already installed. |
| **MongoDB** | **Atlas** (cloud, recommended) **or** MongoDB Community installed locally on Windows. |
| **Two terminals** | One for the Spring Boot API, one for the Vite frontend. |

### Quick checks (PowerShell)

Open **Windows Terminal** or **PowerShell** and run:

```powershell
java -version
node -v
npm -v
git --version
```

- If `java -version` fails, install a JDK and reopen the terminal.
- If `node` / `npm` fail, reinstall Node.js LTS and reopen the terminal.

---

## 2. Clone the repo and use the `development` branch

The team integrates on **`development`** (not necessarily `main` for day-to-day work).

```powershell
cd $HOME\Desktop
git clone https://github.com/bigunhe/paf-project.git
cd paf-project
git fetch origin
git checkout development
git pull origin development
```

**If you already cloned the repo earlier:**

```powershell
cd C:\path\to\paf-project
git fetch origin
git checkout development
git pull origin development
```

---

## 3. MongoDB URI — where it goes (very specific)

The backend reads Mongo settings from Spring Boot configuration files under:

`paf-project\backend\src\main\resources\`

### Recommended for the team: `application-local.properties`

This file is **gitignored** — you create it **only on your machine** so your password never goes to GitHub.

**Full path (example if repo is on Desktop):**

```text
C:\Users\<YourWindowsUser>\Desktop\paf-project\backend\src\main\resources\application-local.properties
```

### Create the file

**Option A — Notepad**

1. Open File Explorer and go to: `paf-project\backend\src\main\resources\`
2. Right-click → New → Text Document
3. Name it **`application-local.properties`**  
   (If Windows hides extensions, turn on “File name extensions” in the View menu so you do not end up with `application-local.properties.txt`.)

**Option B — PowerShell**

From the **repo root** (`paf-project`):

```powershell
notepad backend\src\main\resources\application-local.properties
```

If Notepad asks to create a new file, choose **Yes**.

### What to put inside

#### If you use MongoDB Atlas (recommended)

Use the SRV string from Atlas (**Database** → **Connect** → **Drivers**). The database name in the path should be **`smartcampus`** (team convention).

Example (replace with your real user, password, and cluster host):

```properties
spring.data.mongodb.uri=mongodb+srv://MY_USER:MY_PASSWORD@cluster0.xxxxx.mongodb.net/smartcampus?retryWrites=true&w=majority
```

**Password special characters:** If your password contains `@`, `:`, `/`, `#`, `%`, etc., you must **URL-encode** those characters in the URI, or change the password to a simpler one for dev. Atlas documentation explains encoding.

**Atlas Network Access:** In Atlas, **Network Access** must allow your machine (for class MVP, teams sometimes use `0.0.0.0/0`; tighten later for production).

#### If you use MongoDB installed locally on Windows

Default in [application.properties](../backend/src/main/resources/application.properties) is:

`mongodb://localhost:27017/smartcampus`

If you are **not** using `application-local.properties`, you can run the backend **without** the `local` profile and it will use that default — but only if MongoDB is actually running on **127.0.0.1:27017**.

If you still prefer a local file, you can set:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/smartcampus
```

### Do not commit secrets

- Never commit `application-local.properties`.
- Never paste real URIs (with passwords) into GitHub issues or chat.
- The repo’s [.gitignore](../backend/.gitignore) should exclude local Spring files; if you are unsure, ask before `git add`.

More context: [MONGODB_SETUP.md](MONGODB_SETUP.md).

---

## 4. Run the backend (Spring Boot, port 8080)

Always use the **`local` Spring profile** when you rely on **`application-local.properties`** (Atlas or custom URI).

From the **repo root**:

```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

**Notes:**

- Use **`.\mvnw.cmd`** on Windows (not `./mvnw`).
- On PowerShell, the JVM argument often must be **quoted** as shown so `-D` is passed correctly.
- First run may download Maven dependencies; wait until it finishes.

**Success signs in the console:**

- Something like: **Tomcat started on port 8080**
- **Started SmartCampusBackendApplication**
- Log line indicating profile **`local`** is active (when using `application-local.properties`)

**Leave this terminal window open** while you develop.

### Optional: verify the API from PowerShell

```powershell
curl http://localhost:8080/api/v1/users
```

If `curl` is not available in your PowerShell, use:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/users
```

You should get JSON (a list — possibly empty before seeding, depending on DB state).

---

## 5. Run the frontend (Vite, port 5173)

Open a **second** PowerShell window. From the **repo root**:

```powershell
cd frontend
npm install
npm run dev
```

- **`npm install`** — first time after clone or when `package.json` changes.
- **`npm run dev`** — dev server with hot reload.

The terminal prints a URL, usually:

`http://localhost:5173`

Open it in **Chrome** or **Edge**.

### What you should see

- You land on public **`/`** with a single primary **Sign in with Google** action.
- After login, DB role decides redirect: **`USER -> /app`**, **`ADMIN -> /admin`**.
- `/admin` is blocked for non-admin users.

---

## 6. Which areas to smoke-test (by member responsibility)

| Area | Student path | Staff path |
|------|----------------|------------|
| Member 1 — Facilities | `/app/resources` | `/admin/resources` |
| Member 2 — Bookings | `/app/bookings` | `/admin/bookings` |
| Member 3 — Tickets | `/app/report` | `/admin/incidents` |
| Member 4 — Users / alerts | `/app/account`, `/login` | `/admin/users`, header **Alerts** |

Full route table: [05-RUNNING_AND_TEAM_INTEGRATION.md](05-RUNNING_AND_TEAM_INTEGRATION.md).

---

## 7. Common problems on Windows

### “MongoSocketOpenException” / connection refused / timeout

- MongoDB is not reachable: wrong URI, Atlas IP not allowed, wrong password, or local Mongo not running.
- Fix: check Atlas **Network Access** and **Database Users**; test URI with [mongosh](https://www.mongodb.com/docs/mongodb-shell/) or Atlas “Test connection”.

### Backend port 8080 already in use

- Another Spring instance or app is using 8080. Close the old Java process or stop the other server.

### `mvnw.cmd` cannot be loaded / execution policy

- Some corporate PCs block scripts. Run PowerShell as needed for your policy, or use **Command Prompt (cmd.exe)**:

```cmd
cd C:\path\to\paf-project\backend
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend: `npm` errors or EPERM

- Run terminal **as normal user** first; avoid syncing `node_modules` with OneDrive if you see file locking issues — keep the repo in a simple path like `C:\dev\paf-project`.

### Wrong branch / old code

```powershell
git status
git branch
git pull origin development
```

---

## 8. Daily workflow (short)

```powershell
git checkout development
git pull origin development

# Terminal 1
cd path\to\paf-project\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"

# Terminal 2
cd path\to\paf-project\frontend
npm run dev
```

Feature work usually happens on your member branch (see [TEAM_HANDOFF.md](TEAM_HANDOFF.md)); integrate via PR into `development` per team rules [04-GIT_AND_WORKFLOW.md](04-GIT_AND_WORKFLOW.md).
