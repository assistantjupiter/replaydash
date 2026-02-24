# Session Search Documentation

## Overview

ReplayDash includes a powerful full-text search feature that allows you to quickly find sessions across multiple dimensions including metadata, console logs, errors, and custom event data.

## Features

### Search Capabilities

The search functionality supports queries across:

- **Session Metadata:**
  - Session ID
  - User ID
  - User Email
  - URL
  - Browser name
  - Device type
  - Operating system
  - User Agent

- **Event Data:**
  - Console log messages
  - Error messages
  - Custom event data
  - Event types

### Filters

You can refine your search using the following filters:

- **Browser:** Filter by browser type (Chrome, Firefox, Safari, Edge)
- **Device:** Filter by device type (Desktop, Mobile, Tablet)
- **Has Errors:** Show only sessions with or without errors
- **Date Range:** Filter by start date and/or end date

### Sorting

Results can be sorted by:
- Last Active (default)
- Started At
- Event Count

Sort order can be ascending or descending.

### Pagination

Search results are paginated with configurable page size (default: 20 sessions per page).

## API Reference

### Search Endpoint

**GET** `/api/v1/sessions/search`

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Search query (case-insensitive) |
| `browser` | string | No | Filter by browser name |
| `device` | string | No | Filter by device type |
| `os` | string | No | Filter by operating system |
| `hasErrors` | boolean | No | Filter by error presence |
| `startDate` | string | No | Filter by start date (ISO 8601) |
| `endDate` | string | No | Filter by end date (ISO 8601) |
| `limit` | number | No | Results per page (default: 50) |
| `offset` | number | No | Number of results to skip (default: 0) |
| `sortBy` | string | No | Sort field: `startedAt`, `lastActive`, `eventCount` (default: `lastActive`) |
| `sortOrder` | string | No | Sort order: `asc` or `desc` (default: `desc`) |

#### Example Requests

**Basic search:**
```bash
GET /api/v1/sessions/search?q=error
```

**Search with filters:**
```bash
GET /api/v1/sessions/search?q=checkout&browser=chrome&hasErrors=true
```

**Date range search:**
```bash
GET /api/v1/sessions/search?startDate=2024-01-01&endDate=2024-01-31
```

**Pagination:**
```bash
GET /api/v1/sessions/search?limit=20&offset=40
```

#### Response Format

```json
{
  "sessions": [
    {
      "id": "clx...",
      "sessionId": "ses_abc123",
      "userId": "user_123",
      "userEmail": "user@example.com",
      "userAgent": "Mozilla/5.0...",
      "url": "https://example.com/checkout",
      "browser": "Chrome",
      "device": "Desktop",
      "os": "macOS",
      "hasErrors": true,
      "startedAt": "2024-02-24T08:00:00Z",
      "lastActive": "2024-02-24T08:15:00Z",
      "eventCount": 150
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "query": {
    "q": "error",
    "browser": "chrome"
  }
}
```

## Frontend Usage

### Using the SearchSessions API Function

```typescript
import { searchSessions } from '@/lib/api'

// Basic search
const results = await searchSessions({ q: 'checkout' })

// Advanced search with filters
const results = await searchSessions({
  q: 'payment',
  browser: 'chrome',
  device: 'mobile',
  hasErrors: true,
  startDate: '2024-02-01',
  limit: 20,
  offset: 0
})
```

### SessionList Component

The `SessionList` component includes built-in search and filtering UI:

```tsx
import { SessionList } from '@/components/SessionList'

export default function SessionsPage() {
  return (
    <div>
      <h1>Sessions</h1>
      <SessionList />
    </div>
  )
}
```

#### Features:
- **Real-time search** with 500ms debounce
- **Filter dropdowns** for browser, device, and error status
- **Date range pickers** for start and end dates
- **Pagination controls**
- **Loading states** during search
- **Empty states** for no results
- **Search result count**
- **Clear filters button**

## Database Schema

### New Session Fields

The Session model has been extended with the following searchable fields:

```prisma
model Session {
  // ... existing fields
  browser    String?  // e.g., "Chrome", "Firefox", "Safari"
  device     String?  // e.g., "Desktop", "Mobile", "Tablet"
  os         String?  // e.g., "Windows", "macOS", "iOS"
  hasErrors  Boolean  @default(false)
  
  @@index([browser])
  @@index([device])
  @@index([hasErrors])
  @@index([userEmail])
  @@index([lastActive])
}
```

### Indexes

The following indexes improve search performance:

- `Session.browser` - Fast browser filtering
- `Session.device` - Fast device filtering
- `Session.hasErrors` - Fast error filtering
- `Session.userEmail` - User email lookups
- `Session.lastActive` - Sorting by activity

## Implementation Details

### Search Logic

The search implementation uses PostgreSQL's case-insensitive pattern matching (`ILIKE`) for:
- Session metadata fields
- Event data (including JSON fields)

For more advanced use cases, you can upgrade to PostgreSQL full-text search:

```typescript
// Future enhancement: Full-text search
where: {
  OR: [
    {
      searchVector: {
        search: searchTerm
      }
    }
  ]
}
```

### Performance Considerations

1. **Indexes:** The schema includes indexes on commonly filtered fields
2. **Pagination:** Always use pagination for large datasets
3. **Debouncing:** Frontend implements 500ms debounce for real-time search
4. **Event Search:** Searching through event data may be slower for large sessions

### Optimization Opportunities

For production use with large datasets, consider:

1. **PostgreSQL Full-Text Search:**
   - Add `tsvector` column for full-text indexing
   - Use `to_tsvector` and `to_tsquery` for better performance

2. **Elasticsearch Integration:**
   - Index sessions and events in Elasticsearch
   - Much faster for complex queries and large datasets

3. **Caching:**
   - Cache popular search queries
   - Use Redis for session metadata caching

4. **Database Partitioning:**
   - Partition sessions table by date
   - Improves query performance for date-range searches

## Migration

To apply the schema changes:

```bash
cd packages/api

# Generate Prisma client
npx prisma generate

# Run migration (when database is available)
npx prisma migrate dev --name add_search_fields

# Or apply manually
psql -d replaydash -f prisma/migrations/20260224_add_search_fields/migration.sql
```

## Testing

### Manual Testing

1. Start the API server:
```bash
cd packages/api
npm run dev
```

2. Start the dashboard:
```bash
cd packages/dashboard
npm run dev
```

3. Navigate to the sessions page and test:
   - Search bar with various queries
   - Filter dropdowns
   - Date range selection
   - Pagination controls
   - Clear filters functionality

### API Testing with cURL

```bash
# Basic search
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3001/api/v1/sessions/search?q=error"

# Advanced search
curl -H "X-API-Key: your-api-key" \
  "http://localhost:3001/api/v1/sessions/search?q=checkout&browser=chrome&hasErrors=true&limit=10"
```

## Troubleshooting

### Common Issues

1. **No results found:**
   - Check if sessions exist in the database
   - Verify API key is valid
   - Check browser console for errors

2. **Slow search performance:**
   - Ensure database indexes are created
   - Check database query performance with `EXPLAIN ANALYZE`
   - Consider implementing caching

3. **Event data not searchable:**
   - Verify events have the correct structure
   - Check JSON field paths in search logic
   - Ensure event data is properly stored

## Future Enhancements

- [ ] Saved search queries
- [ ] Search history
- [ ] Advanced query syntax (AND/OR/NOT operators)
- [ ] Faceted search (auto-suggest filters based on results)
- [ ] Export search results
- [ ] Full-text search with PostgreSQL `tsvector`
- [ ] Elasticsearch integration for better performance
- [ ] Search within session player (timeline search)

## Support

For issues or questions about the search feature:
- Check the [main documentation](../README.md)
- Open an issue on GitHub
- Contact support

---

**Last Updated:** February 24, 2026  
**Version:** 1.0.0
