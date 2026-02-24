# ReplayDash API Documentation

Welcome to the ReplayDash API documentation! This guide will help you integrate session replay and user analytics into your application.

## 🚀 Quick Start

### 1. Get Your API Key

1. Log in to your [ReplayDash Dashboard](https://replaydash.com)
2. Navigate to Settings → API Keys
3. Create a new API key
4. Copy your API key (you'll need it for authentication)

### 2. Authentication

All API requests must include your API key in the `x-api-key` header:

```bash
curl -H "x-api-key: your_api_key_here" \
  https://api.replaydash.com/api/v1/sessions
```

## 📚 API Endpoints

### Base URLs

- **Production:** `https://api.replaydash.com`
- **Local Development:** `http://localhost:3001`

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/events` | Ingest session events |
| `GET` | `/api/v1/sessions` | List all sessions |
| `GET` | `/api/v1/sessions/:id` | Get session details |
| `GET` | `/api/v1/sessions/:id/events` | Get session events |

## 📖 Detailed Documentation

### 1. Ingest Events

Capture and store user interaction events for session replay.

**Endpoint:** `POST /api/v1/events`

**Request Body:**

```json
{
  "sessionId": "sess_abc123def456",
  "userId": "user_789xyz",
  "userEmail": "user@example.com",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "url": "https://example.com/dashboard",
  "timestamp": 1708777200000,
  "events": [
    {
      "type": "rrweb/full-snapshot",
      "timestamp": 1708777200000,
      "data": {
        "node": {
          "type": 0,
          "childNodes": []
        },
        "initialOffset": {
          "top": 0,
          "left": 0
        }
      }
    },
    {
      "type": "rrweb/mouse-move",
      "timestamp": 1708777200100,
      "data": {
        "x": 150,
        "y": 200
      }
    }
  ]
}
```

**Response:**

```json
{
  "success": true
}
```

### 2. List Sessions

Retrieve a paginated list of all captured sessions.

**Endpoint:** `GET /api/v1/sessions`

**Query Parameters:**

- `limit` (optional): Number of sessions to return (default: 50, max: 100)
- `offset` (optional): Number of sessions to skip for pagination (default: 0)

**Example Request:**

```bash
curl -H "x-api-key: your_api_key_here" \
  "https://api.replaydash.com/api/v1/sessions?limit=20&offset=0"
```

**Response:**

```json
{
  "sessions": [
    {
      "id": "sess_abc123def456",
      "userId": "user_789xyz",
      "userEmail": "user@example.com",
      "createdAt": "2024-02-24T12:00:00Z",
      "lastEventAt": "2024-02-24T12:05:00Z",
      "eventCount": 42,
      "url": "https://example.com/dashboard"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### 3. Get Session Details

Retrieve detailed information about a specific session.

**Endpoint:** `GET /api/v1/sessions/:id`

**Example Request:**

```bash
curl -H "x-api-key: your_api_key_here" \
  "https://api.replaydash.com/api/v1/sessions/sess_abc123def456"
```

**Response:**

```json
{
  "id": "sess_abc123def456",
  "userId": "user_789xyz",
  "userEmail": "user@example.com",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2024-02-24T12:00:00Z",
  "lastEventAt": "2024-02-24T12:05:00Z",
  "eventCount": 42,
  "duration": 120000,
  "url": "https://example.com/dashboard"
}
```

### 4. Get Session Events

Retrieve all events for a specific session.

**Endpoint:** `GET /api/v1/sessions/:id/events`

**Example Request:**

```bash
curl -H "x-api-key: your_api_key_here" \
  "https://api.replaydash.com/api/v1/sessions/sess_abc123def456/events"
```

**Response:**

```json
{
  "sessionId": "sess_abc123def456",
  "events": [
    {
      "type": "rrweb/full-snapshot",
      "timestamp": 1708777200000,
      "data": {
        "node": {
          "type": 0,
          "childNodes": []
        }
      }
    },
    {
      "type": "rrweb/mouse-move",
      "timestamp": 1708777200100,
      "data": {
        "x": 150,
        "y": 200
      }
    }
  ]
}
```

## 💻 Code Examples

### JavaScript (Fetch API)

```javascript
// Ingest events
async function ingestEvents(sessionId, events) {
  const response = await fetch('https://api.replaydash.com/api/v1/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your_api_key_here'
    },
    body: JSON.stringify({
      sessionId,
      userId: 'user_123',
      userEmail: 'user@example.com',
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      events
    })
  });
  
  return response.json();
}

// List sessions
async function listSessions(limit = 50, offset = 0) {
  const response = await fetch(
    `https://api.replaydash.com/api/v1/sessions?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'x-api-key': 'your_api_key_here'
      }
    }
  );
  
  return response.json();
}

// Get session details
async function getSession(sessionId) {
  const response = await fetch(
    `https://api.replaydash.com/api/v1/sessions/${sessionId}`,
    {
      headers: {
        'x-api-key': 'your_api_key_here'
      }
    }
  );
  
  return response.json();
}

// Get session events
async function getSessionEvents(sessionId) {
  const response = await fetch(
    `https://api.replaydash.com/api/v1/sessions/${sessionId}/events`,
    {
      headers: {
        'x-api-key': 'your_api_key_here'
      }
    }
  );
  
  return response.json();
}
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.replaydash.com/api/v1',
  headers: {
    'x-api-key': 'your_api_key_here'
  }
});

// Ingest events
async function ingestEvents(sessionId, events) {
  const { data } = await api.post('/events', {
    sessionId,
    userId: 'user_123',
    userEmail: 'user@example.com',
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: Date.now(),
    events
  });
  
  return data;
}

// List sessions
async function listSessions(limit = 50, offset = 0) {
  const { data } = await api.get('/sessions', {
    params: { limit, offset }
  });
  
  return data;
}

// Get session details
async function getSession(sessionId) {
  const { data } = await api.get(`/sessions/${sessionId}`);
  return data;
}

// Get session events
async function getSessionEvents(sessionId) {
  const { data } = await api.get(`/sessions/${sessionId}/events`);
  return data;
}
```

### TypeScript

```typescript
interface IngestEventsPayload {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  userAgent?: string;
  url?: string;
  timestamp: number;
  events: Array<{
    type: string;
    timestamp: number;
    data: any;
  }>;
}

interface Session {
  id: string;
  userId?: string;
  userEmail?: string;
  createdAt: string;
  lastEventAt: string;
  eventCount: number;
  url?: string;
}

class ReplayDashAPI {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL = 'https://api.replaydash.com/api/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async ingestEvents(payload: IngestEventsPayload): Promise<{ success: boolean }> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listSessions(limit = 50, offset = 0) {
    return this.request<{
      sessions: Session[];
      total: number;
      limit: number;
      offset: number;
    }>(`/sessions?limit=${limit}&offset=${offset}`);
  }

  async getSession(sessionId: string) {
    return this.request<Session>(`/sessions/${sessionId}`);
  }

  async getSessionEvents(sessionId: string) {
    return this.request<{
      sessionId: string;
      events: Array<{
        type: string;
        timestamp: number;
        data: any;
      }>;
    }>(`/sessions/${sessionId}/events`);
  }
}

// Usage
const api = new ReplayDashAPI('your_api_key_here');

// Ingest events
await api.ingestEvents({
  sessionId: 'sess_abc123',
  userId: 'user_789',
  userEmail: 'user@example.com',
  timestamp: Date.now(),
  events: [
    {
      type: 'rrweb/full-snapshot',
      timestamp: Date.now(),
      data: { /* ... */ }
    }
  ]
});

// List sessions
const { sessions, total } = await api.listSessions(20, 0);

// Get session details
const session = await api.getSession('sess_abc123');

// Get session events
const { events } = await api.getSessionEvents('sess_abc123');
```

### cURL

```bash
# Ingest events
curl -X POST https://api.replaydash.com/api/v1/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "sessionId": "sess_abc123def456",
    "userId": "user_789xyz",
    "userEmail": "user@example.com",
    "timestamp": 1708777200000,
    "events": [
      {
        "type": "rrweb/full-snapshot",
        "timestamp": 1708777200000,
        "data": {}
      }
    ]
  }'

# List sessions
curl -X GET "https://api.replaydash.com/api/v1/sessions?limit=20&offset=0" \
  -H "x-api-key: your_api_key_here"

# Get session details
curl -X GET "https://api.replaydash.com/api/v1/sessions/sess_abc123def456" \
  -H "x-api-key: your_api_key_here"

# Get session events
curl -X GET "https://api.replaydash.com/api/v1/sessions/sess_abc123def456/events" \
  -H "x-api-key: your_api_key_here"
```

### Python (Requests)

```python
import requests
import time

class ReplayDashAPI:
    def __init__(self, api_key, base_url='https://api.replaydash.com/api/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'x-api-key': api_key
        }
    
    def ingest_events(self, session_id, events, **kwargs):
        payload = {
            'sessionId': session_id,
            'timestamp': int(time.time() * 1000),
            'events': events,
            **kwargs
        }
        response = requests.post(
            f'{self.base_url}/events',
            json=payload,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def list_sessions(self, limit=50, offset=0):
        response = requests.get(
            f'{self.base_url}/sessions',
            params={'limit': limit, 'offset': offset},
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_session(self, session_id):
        response = requests.get(
            f'{self.base_url}/sessions/{session_id}',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()
    
    def get_session_events(self, session_id):
        response = requests.get(
            f'{self.base_url}/sessions/{session_id}/events',
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

# Usage
api = ReplayDashAPI('your_api_key_here')

# Ingest events
api.ingest_events(
    session_id='sess_abc123',
    events=[
        {
            'type': 'rrweb/full-snapshot',
            'timestamp': int(time.time() * 1000),
            'data': {}
        }
    ],
    userId='user_789',
    userEmail='user@example.com'
)

# List sessions
sessions = api.list_sessions(limit=20)

# Get session details
session = api.get_session('sess_abc123')

# Get session events
events = api.get_session_events('sess_abc123')
```

### Node.js (Node-Fetch)

```javascript
const fetch = require('node-fetch');

class ReplayDashAPI {
  constructor(apiKey, baseURL = 'https://api.replaydash.com/api/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async ingestEvents(payload) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listSessions(limit = 50, offset = 0) {
    return this.request(`/sessions?limit=${limit}&offset=${offset}`);
  }

  async getSession(sessionId) {
    return this.request(`/sessions/${sessionId}`);
  }

  async getSessionEvents(sessionId) {
    return this.request(`/sessions/${sessionId}/events`);
  }
}

module.exports = ReplayDashAPI;

// Usage
const api = new ReplayDashAPI('your_api_key_here');

(async () => {
  // Ingest events
  await api.ingestEvents({
    sessionId: 'sess_abc123',
    userId: 'user_789',
    userEmail: 'user@example.com',
    timestamp: Date.now(),
    events: [
      {
        type: 'rrweb/full-snapshot',
        timestamp: Date.now(),
        data: {}
      }
    ]
  });

  // List sessions
  const { sessions } = await api.listSessions(20, 0);
  console.log(sessions);

  // Get session details
  const session = await api.getSession('sess_abc123');
  console.log(session);

  // Get session events
  const { events } = await api.getSessionEvents('sess_abc123');
  console.log(events);
})();
```

## 🔒 Security Best Practices

1. **Never expose your API key in client-side code** - API keys should only be used server-side
2. **Use environment variables** - Store API keys in environment variables, not in code
3. **Rotate keys regularly** - Generate new API keys periodically
4. **Use HTTPS** - Always use HTTPS in production
5. **Implement rate limiting** - Respect rate limits to avoid throttling

## 📊 Rate Limits

- **Events ingestion:** 1000 requests/minute
- **Session queries:** 100 requests/minute

If you exceed these limits, you'll receive a `429 Too Many Requests` response.

## ❗ Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (invalid or missing API key)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🛠️ SDK Integration

For the easiest integration, use the ReplayDash SDK which handles event capture and API communication automatically:

```bash
npm install @replaydash/sdk
```

```javascript
import ReplayDash from '@replaydash/sdk';

ReplayDash.init({
  apiKey: 'your_api_key_here',
  captureConsole: true,
  captureNetwork: true,
});
```

See the [SDK documentation](../../packages/sdk/README.md) for more details.

## 📚 Additional Resources

- [Interactive API Documentation](./index.html) - Try the API in your browser
- [OpenAPI Specification](./openapi.json) - Download the full API spec
- [GitHub Repository](https://github.com/yourusername/replaydash) - View the source code
- [Dashboard](https://replaydash.com) - Manage your account and view sessions

## 💬 Support

Need help? Reach out to us:

- **Email:** support@replaydash.com
- **GitHub Issues:** [github.com/yourusername/replaydash/issues](https://github.com/yourusername/replaydash/issues)
- **Discord:** [Join our community](https://discord.gg/replaydash)

## 📝 Changelog

### v1.0.0 (2024-02-24)
- Initial API release
- Event ingestion endpoint
- Session management endpoints
- OpenAPI 3.0 specification
- Interactive documentation
