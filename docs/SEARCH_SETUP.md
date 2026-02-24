# Session Search Feature - Setup Guide

## Quick Start

Follow these steps to set up and test the new session search feature.

## Prerequisites

- PostgreSQL database running
- Node.js 18+ installed
- ReplayDash API and Dashboard packages set up

## Step 1: Update Dependencies

Make sure you have the latest dependencies installed:

```bash
# From project root
npm install

# Or in each package
cd packages/api && npm install
cd packages/dashboard && npm install
```

## Step 2: Apply Database Migration

The search feature adds new fields to the `Session` model. Apply the migration:

### Option A: Using Prisma Migrate (Recommended)

```bash
cd packages/api

# Generate Prisma client with new schema
npx prisma generate

# Apply migration (interactive)
npx prisma migrate dev --name add_search_fields
```

### Option B: Manual Migration

If you prefer to review the SQL first or are in a production environment:

```bash
cd packages/api

# Generate Prisma client
npx prisma generate

# Review the migration SQL
cat prisma/migrations/20260224_add_search_fields/migration.sql

# Apply manually to your database
psql -d replaydash -f prisma/migrations/20260224_add_search_fields/migration.sql
```

### Migration SQL

The migration adds these fields and indexes to the `Session` table:

```sql
ALTER TABLE "Session" 
  ADD COLUMN "browser" TEXT,
  ADD COLUMN "device" TEXT,
  ADD COLUMN "os" TEXT,
  ADD COLUMN "hasErrors" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Session_userEmail_idx" ON "Session"("userEmail");
CREATE INDEX "Session_browser_idx" ON "Session"("browser");
CREATE INDEX "Session_device_idx" ON "Session"("device");
CREATE INDEX "Session_hasErrors_idx" ON "Session"("hasErrors");
CREATE INDEX "Session_lastActive_idx" ON "Session"("lastActive");
```

## Step 3: Build the API

```bash
cd packages/api
npm run build
```

## Step 4: Start the Services

### Terminal 1 - API Server

```bash
cd packages/api
npm run dev
```

The API should be running on `http://localhost:3001`

### Terminal 2 - Dashboard

```bash
cd packages/dashboard
npm run dev
```

The dashboard should be running on `http://localhost:3000`

## Step 5: Test the Feature

### 1. Via Dashboard UI

1. Open `http://localhost:3000/sessions` in your browser
2. You should see:
   - Search bar at the top
   - Filter dropdowns (Browser, Device, Errors)
   - Date range pickers
   - Session table with enhanced columns

3. Try searching:
   - Enter a search term in the search bar
   - Select filters from the dropdowns
   - Pick a date range
   - Click "Clear filters" to reset

### 2. Via API (cURL)

```bash
# Set your API key
export API_KEY="your-api-key-here"

# Basic search
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:3001/api/v1/sessions/search?q=error"

# Search with filters
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:3001/api/v1/sessions/search?q=checkout&browser=chrome&hasErrors=true"

# Date range
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:3001/api/v1/sessions/search?startDate=2024-02-01&endDate=2024-02-29"

# Pagination
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:3001/api/v1/sessions/search?limit=10&offset=20"
```

### 3. Via JavaScript/TypeScript

```typescript
import { searchSessions } from '@/lib/api'

// Basic search
const results = await searchSessions({ q: 'error' })
console.log(`Found ${results.total} sessions`)

// Advanced search
const filtered = await searchSessions({
  q: 'checkout',
  browser: 'chrome',
  device: 'mobile',
  hasErrors: true,
  startDate: '2024-02-01',
  endDate: '2024-02-29',
  limit: 20,
  offset: 0
})
```

## Step 6: Populate Search Fields for Existing Sessions

If you have existing sessions in the database, they won't have the new `browser`, `device`, `os` fields populated. You can:

### Option A: Wait for New Sessions

New sessions will automatically populate these fields when the SDK is updated to send this metadata.

### Option B: Backfill Existing Sessions

Create a script to parse `userAgent` and populate the new fields:

```typescript
// scripts/backfill-session-metadata.ts
import { PrismaClient } from '@prisma/client'
import { parse } from 'useragent' // npm install useragent

const prisma = new PrismaClient()

async function backfillMetadata() {
  const sessions = await prisma.session.findMany({
    where: {
      OR: [
        { browser: null },
        { device: null },
        { os: null }
      ]
    }
  })

  console.log(`Backfilling ${sessions.length} sessions...`)

  for (const session of sessions) {
    if (session.userAgent) {
      const agent = parse(session.userAgent)
      
      await prisma.session.update({
        where: { id: session.id },
        data: {
          browser: agent.family,
          device: agent.device.family === 'Other' ? 'Desktop' : agent.device.family,
          os: agent.os.family,
        }
      })
    }
  }

  console.log('Backfill complete!')
}

backfillMetadata()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
```

Run it:
```bash
cd packages/api
npm install useragent @types/useragent
npx ts-node scripts/backfill-session-metadata.ts
```

## Step 7: Run Tests (Optional)

```bash
cd packages/api
npm test

# Or run specific test file
npm test -- sessions.service.spec.ts
```

## Troubleshooting

### Issue: Migration Fails

**Error:** `relation "Session" already exists`

**Solution:** The migration has already been applied. Run:
```bash
npx prisma db pull
npx prisma generate
```

### Issue: No Search Results

**Possible causes:**
1. No sessions in database
2. API key is invalid
3. Database indexes not created

**Solution:**
```bash
# Check database connection
npx prisma studio

# Verify indexes exist
psql -d replaydash -c "\d Session"
```

### Issue: Slow Search Performance

**Possible causes:**
1. Large number of sessions
2. Indexes not applied
3. Complex queries

**Solution:**
1. Verify indexes are created: `\d Session` in psql
2. Add pagination: Always use `limit` parameter
3. Consider implementing caching for popular queries

### Issue: Frontend Not Showing Search UI

**Possible causes:**
1. Component not updated
2. Cache issue

**Solution:**
```bash
cd packages/dashboard
rm -rf .next
npm run dev
```

## Next Steps

1. **Update SDK** to send `browser`, `device`, `os` metadata
2. **Add Error Tracking** to set `hasErrors` flag
3. **Optimize Performance** if you have >10k sessions
4. **Add More Filters** as needed for your use case

## Performance Tuning

For production deployments with large datasets:

1. **Enable Connection Pooling:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/replaydash?schema=public&connection_limit=20&pool_timeout=20"
```

2. **Add Full-Text Search Index (PostgreSQL):**
```sql
ALTER TABLE "Session" ADD COLUMN search_vector tsvector;

CREATE INDEX session_search_idx ON "Session" 
USING gin(search_vector);

CREATE TRIGGER session_search_update BEFORE INSERT OR UPDATE
ON "Session" FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', 
  sessionId, userId, userEmail, url);
```

3. **Consider Elasticsearch** for very large datasets (>1M sessions)

## Resources

- [Main Search Documentation](./SEARCH.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the logs: `packages/api/logs/`
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details (Node version, PostgreSQL version)

---

**Setup Date:** February 24, 2026  
**Feature Version:** 1.0.0
