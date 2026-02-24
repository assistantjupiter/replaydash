# ReplayDash Self-Tracking (Dogfooding)

ReplayDash can track its own usage! This allows you to see how people interact with the dashboard itself.

## How It Works

When enabled, the dashboard will:
- Track page views as you navigate
- Record your user ID and email (from Clerk)
- Send events to your own ReplayDash API
- Show up as sessions in your dashboard

## Enable Self-Tracking

1. **Set the environment variable:**
   ```bash
   # In packages/dashboard/.env.local
   NEXT_PUBLIC_ENABLE_REPLAYDASH=true
   ```

2. **Ensure API is running:**
   ```bash
   npm run dev:api
   ```

3. **Restart the dashboard:**
   ```bash
   npm run dev:dashboard
   ```

4. **Use the dashboard normally** and your sessions will appear in `/dashboard/sessions`!

## Configuration

The tracking uses these environment variables:

- `NEXT_PUBLIC_ENABLE_REPLAYDASH` - Set to `true` to enable tracking
- `NEXT_PUBLIC_API_URL` - Your ReplayDash API URL (default: http://localhost:3002)
- `NEXT_PUBLIC_API_KEY` - Your API key (default: dev-secret-key-change-in-production)

## What Gets Tracked

Currently tracked events:
- **Page Views** - Every page you visit with URL and pathname
- **User Info** - Your Clerk user ID and email
- **Navigation** - Browser forward/back navigation

## Session Details

Sessions include:
- Session ID (stored in localStorage)
- User ID (from Clerk)
- User Email (from Clerk)
- User Agent
- Timestamps
- URLs visited

## Privacy

- Only enabled when `NEXT_PUBLIC_ENABLE_REPLAYDASH=true`
- Data stays in your local database
- You control what gets tracked
- Perfect for testing and demos

## Future Enhancements

Once the full SDK is published, this will automatically upgrade to include:
- Full DOM snapshots for session replay
- Console log capture
- Network request monitoring
- Error tracking
- Click/scroll recording

For now, it tracks basic page views which is perfect for seeing real usage patterns!

## Example Usage

```typescript
// The component in src/components/ReplayDashInit.tsx handles this automatically
// When a user navigates:
POST /api/v1/events
{
  "sessionId": "session_1234567890_abc123",
  "userId": "user_xyz",
  "userEmail": "omedinapr@gmail.com",
  "events": [{
    "type": "page_view",
    "timestamp": 1234567890000,
    "data": {
      "url": "http://localhost:3000/dashboard/sessions",
      "pathname": "/dashboard/sessions",
      "userAgent": "Mozilla/5.0..."
    }
  }]
}
```

## Viewing Your Sessions

Navigate to **Dashboard → Sessions** and you'll see your own browsing sessions appear!

Filter by your email (omedinapr@gmail.com) to see only your activity.
