# Facilities MongoDB Initialization

This script initializes the Facilities module data in the `smartcampus` database.

## Script

- `init-facilities.js`

## Run (Windows PowerShell)

From the repository root:

```powershell
mongosh "mongodb://localhost:27017/smartcampus" "./backend/mongo/init-facilities.js"
```

If your backend uses Atlas, replace the URI:

```powershell
mongosh "mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/smartcampus?retryWrites=true&w=majority" "./backend/mongo/init-facilities.js"
```

## Verify

```powershell
mongosh "mongodb://localhost:27017/smartcampus" --eval "db.resources.find({}, { name: 1, type: 1, status: 1 }).pretty()"
```
