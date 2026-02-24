# API Reference

ReplayDash REST API documentation.

## Base URL

```
Production: https://api.replaydash.com
Development: http://localhost:3001
```

## Authentication

All API requests require an API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" https://api.replaydash.com/api/v1/sessions
```

## Endpoints

### POST /api/v1/events

Ingest session events from SDK.

**Headers:**
```
X-API-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "1706123456789-abc123xyz",
  "userId": "user-123",
  "userEmail": "user@example.com",
  "userAgent": "Mozilla/5.0...",
  "url": "https://example.com/page",
  "events": [
    {
      "type": "rrweb",
      "timestamp": 1706123456789,
      "data": { /* rrweb event data */ }
    },
    {
      "type": "console",
      "timestamp": 1706123456790,
      "data": {
        "level": "log",
        "args": ["Hello, world!"]
      }
    }
  ],
  "timestamp": 1706123456789
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK` - Events accepted
- `401 Unauthorized` - Invalid API key
- `400 Bad Request` - Invalid request body
- `500 Internal Server Error` - Server error

---

### GET /api/v1/sessions

List all sessions.

**Headers:**
```
X-API-Key: your-api-key
```

**Query Parameters:**
- `limit` (number, optional): Max sessions to return (default: 50, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Example:**
```bash
curl -H "X-API-Key: your-api-key" \
  "https://api.replaydash.com/api/v1/sessions?limit=10&offset=0"
```

**Response:**
```json
{
  "sessions": [
    {
      "id": "clr1234567890",
      "sessionId": "1706123456789-abc123xyz",
      "userId": "user-123",
      "userEmail": "user@example.com",
      "userAgent": "Mozilla/5.0...",
      "url": "https://example.com/page",
      "startedAt": "2024-01-24T12:00:00.000Z",
      "lastActive": "2024-01-24T12:05:30.000Z",
      "eventCount": 245
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Invalid API key

---

### GET /api/v1/sessions/:id

Get session details.

**Headers:**
```
X-API-Key: your-api-key
```

**Example:**
```bash
curl -H "X-API-Key: your-api-key" \
  "https://api.replaydash.com/api/v1/sessions/1706123456789-abc123xyz"
```

**Response:**
```json
{
  "id": "clr1234567890",
  "sessionId": "1706123456789-abc123xyz",
  "userId": "user-123",
  "userEmail": "user@example.com",
  "userAgent": "Mozilla/5.0...",
  "url": "https://example.com/page",
  "startedAt": "2024-01-24T12:00:00.000Z",
  "lastActive": "2024-01-24T12:05:30.000Z",
  "eventCount": 245,
  "user": {
    "id": "usr_123",
    "email": "user@example.com"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Session not found
- `401 Unauthorized` - Invalid API key

---

### GET /api/v1/sessions/:id/events

Get all events for a session.

**Headers:**
```
X-API-Key: your-api-key
```

**Example:**
```bash
curl -H "X-API-Key: your-api-key" \
  "https://api.replaydash.com/api/v1/sessions/1706123456789-abc123xyz/events"
```

**Response:**
```json
{
  "session": {
    "id": "clr1234567890",
    "sessionId": "1706123456789-abc123xyz",
    "startedAt": "2024-01-24T12:00:00.000Z",
    "eventCount": 245
  },
  "events": [
    {
      "id": "evt_001",
      "type": "rrweb",
      "timestamp": 1706123456789,
      "data": { /* rrweb event data */ }
    },
    {
      "id": "evt_002",
      "type": "console",
      "timestamp": 1706123456790,
      "data": {
        "level": "log",
        "args": ["Hello, world!"]
      }
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Session not found
- `401 Unauthorized` - Invalid API key

---

## Error Response Format

All errors return JSON:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Rate Limiting

**Current Limits:**
- Event ingestion: 100 requests/minute per API key
- Session queries: 1000 requests/minute per API key

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706123520
```

## Event Types

### `rrweb`
DOM snapshot and mutation events from rrweb library.

### `console`
Console log capture.
```json
{
  "type": "console",
  "timestamp": 1706123456789,
  "data": {
    "level": "log" | "info" | "warn" | "error" | "debug",
    "args": [/* console arguments */]
  }
}
```

### `error`
JavaScript errors and unhandled rejections.
```json
{
  "type": "error",
  "timestamp": 1706123456789,
  "data": {
    "message": "Error message",
    "stack": "Error stack trace"
  }
}
```

## Webhooks (Coming Soon)

Subscribe to events:
- `session.started`
- `session.ended`
- `error.captured`

## SDKs

- **JavaScript**: [@replaydash/sdk](https://www.npmjs.com/package/@replaydash/sdk)
- **React**: Built-in support via JavaScript SDK
- **Vue**: Built-in support via JavaScript SDK
- **Angular**: Built-in support via JavaScript SDK

## Support

- Documentation: https://docs.replaydash.com
- API Status: https://status.replaydash.com
- Email: api@replaydash.com
