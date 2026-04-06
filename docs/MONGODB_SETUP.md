# MongoDB setup for Smart Campus (MVP)

There is **no separate “Mongo project” inside Spring Boot** you must create in the IDE. You only need a **running MongoDB server** (or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster) and a **connection URI**. The app uses the database name in that URI (default: `smartcampus`). Collections such as `users`, `resources`, `bookings`, etc. are created automatically when your code first saves documents.

## Option A: MongoDB locally (Mac / Windows / Linux)

1. Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) (or use Homebrew on Mac: `brew tap mongodb/brew && brew install mongodb-community@7.0` — exact formula names may vary).
2. Start the service (examples):
   - **macOS (Homebrew):** `brew services start mongodb-community@7.0`
   - Or run `mongod --dbpath /path/to/data` if you manage data directory yourself.
3. Confirm it listens on **port 27017** (default).  
   - With [mongosh](https://www.mongodb.com/docs/mongodb-shell/): `mongosh "mongodb://localhost:27017/smartcampus" --eval "db.runCommand({ ping: 1 })"`
4. In the repo, the backend defaults to:
   - `mongodb://localhost:27017/smartcampus`  
   See [`backend/src/main/resources/application.properties`](../backend/src/main/resources/application.properties).

**After starting the API** (`./mvnw spring-boot:run` in `backend/`), you should see collections under the `smartcampus` database if data was written (e.g. seeded users).

## Option B: MongoDB Atlas (free tier — no local install)

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an **Atlas Project** (this is only an org/container in Atlas, not a Java project).
3. Create a **free M0 cluster**.
4. **Database Access:** add a database user (username/password).
5. **Network Access:** add `0.0.0.0/0` for MVP/dev (tighten for production) or your current IP.
6. **Connect** → Drivers → copy the **SRV connection string** (e.g. `mongodb+srv://USER:PASS@cluster0....mongodb.net/...`).
7. Append the database name if missing, e.g. `...mongodb.net/smartcampus?retryWrites=true&w=majority`.
8. Set the URI **without committing secrets**:
   - **Recommended:** environment variable (Spring Boot maps it automatically):
     ```bash
     export SPRING_DATA_MONGODB_URI="mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/smartcampus?retryWrites=true&w=majority"
     ```
   - Or a local `.env` used by your run configuration (never commit `.env`).

## Spring Data “repositories”

Interfaces like `UserRepository` and `NotificationRepository` extend `MongoRepository`. Spring Boot creates the implementation at runtime once MongoDB is reachable — **you do not create a separate MongoDB project in the codebase** beyond that URI and the `@Document` entities.

## Quick verification checklist

1. MongoDB reachable (local ping or Atlas string tested with mongosh).
2. From `backend/`: `./mvnw spring-boot:run` starts without connection errors.
3. Optional: `curl http://localhost:8080/api/v1/users` returns JSON (seeded dev users after first run).

If the backend fails on startup with a **connection refused** error, MongoDB is not running or the URI host/port is wrong.
