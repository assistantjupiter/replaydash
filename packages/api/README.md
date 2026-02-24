# @replaydash/api

ReplayDash backend API server.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your database and Redis credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/replaydash?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
API_KEY=your-secret-api-key
CORS_ORIGIN=http://localhost:3000
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

## Development

```bash
npm run dev
```

API will be available at `http://localhost:3001`

## API Endpoints

### POST /api/v1/events
Ingest session events from SDK.

**Headers:**
- `X-API-Key`: Your API key
- `Content-Type`: application/json

**Body:**
```json
{
  "sessionId": "string",
  "userId": "string (optional)",
  "userEmail": "string (optional)",
  "userAgent": "string",
  "url": "string",
  "events": [
    {
      "type": "string",
      "timestamp": "number",
      "data": "any"
    }
  ],
  "timestamp": "number"
}
```

### GET /api/v1/sessions
List all sessions.

**Query params:**
- `limit` (default: 50)
- `offset` (default: 0)

### GET /api/v1/sessions/:id
Get session details.

### GET /api/v1/sessions/:id/events
Get all events for a session.

## Architecture

- **NestJS** - TypeScript backend framework
- **Prisma** - Database ORM
- **Bull** - Queue for async event processing
- **PostgreSQL** - Primary database
- **Redis** - Queue backend

## License

MIT
