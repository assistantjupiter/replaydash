# ReplayDash Architecture

## Overview

ReplayDash is a session replay and analytics platform consisting of three main components:

1. **Browser SDK** - Captures user interactions in the browser
2. **Backend API** - Receives, stores, and serves session data
3. **Dashboard** - Admin UI for viewing replays and analytics

## System Design

```
┌─────────────────┐
│  User Browser   │
│                 │
│  ┌───────────┐  │
│  │    SDK    │──┼──┐
│  └───────────┘  │  │
└─────────────────┘  │
                     │ HTTP/WebSocket
                     │
                ┌────▼─────┐
                │   API    │
                │ (NestJS) │
                └────┬─────┘
                     │
                ┌────▼────┐
                │Database │
                │(Postgres)│
                └─────────┘
                     ▲
                     │
                ┌────┴─────┐
                │Dashboard │
                │(Next.js) │
                └──────────┘
```

## Components

### 1. Browser SDK (`@replaydash/sdk`)

**Purpose**: Capture user interactions in real-time and send them to the API

**Key Responsibilities**:
- DOM mutation tracking (using MutationObserver)
- Event listening (clicks, scrolls, inputs, navigation)
- Network request interception (fetch/XHR)
- Console log capture
- Error tracking (window.onerror, unhandledrejection)
- Data masking for privacy
- Event batching and compression
- Session management

**Architecture**:
```typescript
class ReplayDash {
  - observers: MutationObserver[]
  - eventQueue: Event[]
  - sessionId: string
  
  + init(): void
  + stop(): void
  + track(name, props): void
  - captureDOM(): void
  - captureEvents(): void
  - sendBatch(): void
}
```

**Data Flow**:
1. User interacts with page
2. SDK observers capture events
3. Events are batched in memory
4. Batch is sent to API every N seconds or on page unload
5. Failed requests are queued for retry

### 2. Backend API (`@replaydash/api`)

**Purpose**: Receive, validate, store, and serve session data

**Key Endpoints**:

```
POST   /api/events              # Receive event batch
GET    /api/sessions            # List sessions
GET    /api/sessions/:id        # Get session details
GET    /api/sessions/:id/events # Get session events
POST   /api/auth/login          # Authentication
GET    /api/analytics/stats     # Dashboard stats
```

**Database Schema** (Prisma):

```prisma
model Session {
  id          String   @id @default(cuid())
  userId      String?
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  url         String
  userAgent   String
  viewport    Json
  events      Event[]
  createdAt   DateTime @default(now())
}

model Event {
  id         String   @id @default(cuid())
  sessionId  String
  type       String
  timestamp  DateTime
  data       Json
  session    Session  @relation(fields: [sessionId], references: [id])
  createdAt  DateTime @default(now())
  
  @@index([sessionId, timestamp])
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

**Services**:
- **EventService**: Process and store events
- **SessionService**: Manage sessions and aggregations
- **AnalyticsService**: Generate statistics
- **AuthService**: Handle authentication (Better Auth)

### 3. Dashboard (`@replaydash/dashboard`)

**Purpose**: Admin UI for viewing sessions and analytics

**Key Pages**:
- `/` - Home/stats overview
- `/sessions` - Session list with filters
- `/sessions/[id]` - Session replay player
- `/analytics` - Charts and insights
- `/settings` - Configuration

**Tech**:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components (optional)
- TanStack Query for data fetching
- Zustand for state management

**Session Player**:
The replay player reconstructs the DOM from events and "plays" them back in chronological order. Similar to rrweb, but simpler.

### 4. Shared Types (`@replaydash/shared`)

**Purpose**: Common TypeScript types used across all packages

**Exports**:
- Event types (`ClickEvent`, `InputEvent`, etc.)
- Session types
- API response types
- Enums and constants

## Data Flow

### Recording Flow

```
Browser → SDK → API → Database
   ↓
[User clicks button]
   ↓
[SDK captures ClickEvent]
   ↓
[SDK batches event]
   ↓
[SDK sends batch after 5s]
   ↓
[API validates events]
   ↓
[API stores in Postgres]
```

### Replay Flow

```
Dashboard → API → Database
    ↓
[User opens session]
    ↓
[Dashboard fetches events]
    ↓
[API retrieves from DB]
    ↓
[Dashboard plays events]
    ↓
[Reconstruct DOM step-by-step]
```

## Privacy & Security

**Data Masking**:
- Mask all `<input>` fields by default
- Mask text based on CSS selectors
- Mask sensitive attributes (data-private, etc.)
- Allow opt-in unmasking per element

**Authentication**:
- Better Auth for user management
- API keys for SDK authentication
- JWT tokens for dashboard access

**CORS**:
- Whitelist allowed origins
- Validate API keys before accepting events

## Performance Considerations

**SDK**:
- Throttle scroll events (100ms)
- Batch events (send every 5s or 100 events)
- Compress payloads with gzip/brotli
- Use requestIdleCallback for non-critical work

**API**:
- Use database indexes on sessionId + timestamp
- Implement pagination for large result sets
- Cache session metadata in Redis (future)
- Stream large event payloads

**Dashboard**:
- Use virtual scrolling for event lists
- Load events in chunks during replay
- Optimize player rendering (RAF, debouncing)

## Deployment

**Monorepo**:
- Single repo, multiple deployable units
- Turborepo handles builds and caching

**Suggested Hosting**:
- **Dashboard**: Vercel (Next.js optimized)
- **API**: Railway / Fly.io / DigitalOcean
- **Database**: Supabase / Railway / Neon
- **SDK**: Served as static JS from CDN

## Future Enhancements

- **Heatmaps**: Visualize clicks and scrolls
- **Funnels**: Track user flows
- **A/B Testing**: Compare session behavior
- **Alerts**: Notify on errors or anomalies
- **Session Search**: Full-text search on events
- **User Profiles**: Link sessions to users
- **Team Collaboration**: Share sessions, add comments

---

This architecture is designed to be simple, scalable, and privacy-focused.
