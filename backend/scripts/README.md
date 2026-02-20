# Migration Scripts

## migrate-bookings.js

Migrates or clears old booking records that use the legacy schema (`userId`/`eventId` as strings) to the new schema (`user`/`event` as ObjectId references).

### Usage

```bash
# From the backend directory
npm run migrate:bookings

# Or directly
node scripts/migrate-bookings.js
```

### What it does

1. **Connects** to MongoDB using `MONGO_URI` from `.env`
2. **Scans** all booking records
3. **Migrates** records where `userId`/`eventId` are valid ObjectIds:
   - Converts `userId` → `user` (ObjectId)
   - Converts `eventId` → `event` (ObjectId)
   - Adds default `status: "confirmed"` and `seats: 1` if missing
   - Removes old `userId`/`eventId` fields
4. **Deletes** records where `userId`/`eventId` are invalid or incompatible
5. **Skips** records already using the new schema
6. **Reports** a summary of actions taken

### Safety

- ✅ **Read-only check**: Scans before making changes
- ✅ **Non-destructive**: Only migrates valid data, deletes only invalid records
- ✅ **Idempotent**: Safe to run multiple times
- ✅ **Detailed logging**: Shows exactly what happened to each record

### Example Output

```
✅ MongoDB connected

📊 Found 5 total booking(s)
✅ Migrated booking 507f1f77bcf86cd799439011
✅ Migrated booking 507f191e810c19729de860ea
🗑️  Deleted booking 507f1f77bcf86cd799439012 (invalid userId/eventId format)
⏭️  Skipping booking 507f1f77bcf86cd799439013 - already migrated

==================================================
📋 Migration Summary:
   ✅ Migrated: 2
   🗑️  Deleted: 1
   ⏭️  Skipped: 2
==================================================

📊 Final booking count: 4

✅ Migration completed!
```
