# ReplayDash Quick Start

Get ReplayDash running in under 10 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- npm or yarn

## 1. Install Dependencies

```bash
cd /Users/jupiter/Projects/replaydash
npm install
```

## 2. Setup PostgreSQL Database

Create a database:

```bash
createdb replaydash
```

Or using psql:

```sql
CREATE DATABASE replaydash;
```

## 3. Configure Environment Variables

### API (.env)

```bash
cd packages/api
cp .env.example .env
```

Edit `packages/api/.env`:

```env
DATABASE_URL="postgresql://localhost/replaydash?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
API_KEY=dev-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

### Dashboard (.env.local)

```bash
cd packages/dashboard
cp .env.example .env.local
```

Edit `packages/dashboard/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=dev-secret-key-change-in-production
```

## 4. Setup Database Schema

```bash
cd packages/api
npm run prisma:generate
npm run prisma:migrate
```

## 5. Start Services

### Terminal 1: API Server

```bash
cd packages/api
npm run dev
```

### Terminal 2: Dashboard

```bash
cd packages/dashboard
npm run dev
```

### Terminal 3: Redis (if not running)

```bash
redis-server
```

## 6. Test Your Setup

Open http://localhost:3000 in your browser. You should see the ReplayDash dashboard.

## 7. Integrate SDK

### Option A: Install from local build

```bash
cd packages/sdk
npm run build
```

Then in your test app:

```bash
npm install /path/to/replaydash/packages/sdk
```

### Option B: Use CDN (after publishing)

```html
<script src="https://cdn.replaydash.com/sdk/latest/replaydash.umd.js"></script>
<script>
  ReplayDash.replayDash.init({
    apiKey: 'dev-secret-key-change-in-production',
    endpoint: 'http://localhost:3001',
  });
</script>
```

## 8. Create Test HTML Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>ReplayDash Test</title>
</head>
<body>
  <h1>ReplayDash Test Page</h1>
  <button id="testBtn">Click Me!</button>
  <input type="text" placeholder="Type something..." />
  
  <script type="module">
    import { replayDash } from '/path/to/replaydash/packages/sdk/dist/replaydash.esm.js';
    
    replayDash.init({
      apiKey: 'dev-secret-key-change-in-production',
      endpoint: 'http://localhost:3001',
      captureConsole: true,
      maskAllInputs: false, // For testing
    });
    
    console.log('ReplayDash initialized!');
    
    document.getElementById('testBtn').addEventListener('click', () => {
      console.log('Button clicked!');
    });
  </script>
</body>
</html>
```

## 9. View Sessions

1. Interact with your test page (click, type, scroll)
2. Wait ~10 seconds for events to flush
3. Open http://localhost:3000/sessions
4. Click "View Replay" on your session

## Troubleshooting

### "Failed to fetch sessions"
- Check that the API is running on port 3001
- Verify NEXT_PUBLIC_API_KEY matches API_KEY in API .env
- Check browser console for CORS errors

### "No sessions found"
- Verify events are being sent (check browser Network tab)
- Check API logs for errors
- Verify PostgreSQL and Redis are running

### "Failed to initialize replay player"
- Check browser console for errors
- Verify rrweb-player is installed: `npm list rrweb-player`

## Next Steps

- [SDK Integration Guide](./SDK_INTEGRATION.md)
- [API Reference](./API_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT.md)
