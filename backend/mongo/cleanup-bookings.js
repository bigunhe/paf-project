/**
 * Dev / throwaway DB: remove booking documents.
 *
 * Usage (from repo root, adjust URI/db name):
 *   mongosh "mongodb://localhost:27017/smartcampus" backend/mongo/cleanup-bookings.js
 *
 * Options inside the script:
 *   - Wipe entire collection (default below)
 *   - Or narrow deleteMany({ ... }) to test patterns (e.g. resourceId matching /^TMP_/)
 */

const dbName = 'smartcampus'; // must match connection database
const collName = 'bookings';

const dbRef = db.getSiblingDB(dbName);
const result = dbRef.getCollection(collName).deleteMany({});
print(`Deleted ${result.deletedCount} document(s) from ${dbName}.${collName}`);
