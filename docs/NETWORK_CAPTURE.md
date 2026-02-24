# Network Request Capture

ReplayDash SDK can automatically capture all network requests (fetch and XMLHttpRequest) made by your application. This feature is invaluable for debugging API issues, understanding user interactions, and reproducing bugs.

## Features

- ✅ **Automatic Interception**: Captures all `fetch()` and `XMLHttpRequest` calls
- ✅ **Complete Request/Response Data**: Method, URL, headers, body, status, timing
- ✅ **Privacy Controls**: Sanitize sensitive headers, blacklist URLs, truncate large payloads
- ✅ **Performance**: Minimal overhead, batched with other events
- ✅ **Error Tracking**: Captures failed requests and network errors
- ✅ **Dashboard Integration**: View requests in a timeline with filtering and search

## Basic Usage

Network capture is **enabled by default**. Just initialize ReplayDash:

```typescript
import { replayDash } from '@replaydash/sdk';

replayDash.init({
  apiKey: 'your-api-key',
  // Network capture is ON by default
});
```

To disable network capture:

```typescript
replayDash.init({
  apiKey: 'your-api-key',
  captureNetwork: false, // Disable network capture
});
```

## Configuration Options

Customize network capture behavior with `networkConfig`:

```typescript
replayDash.init({
  apiKey: 'your-api-key',
  captureNetwork: true,
  networkConfig: {
    // Ignore specific URLs (string patterns or regex)
    ignoreUrls: [
      '/analytics',
      /\.png$/,
      /cdn\.example\.com/,
    ],

    // Sanitize sensitive headers (default: true)
    sanitizeHeaders: true,

    // Custom list of sensitive headers to redact
    sensitiveHeaders: [
      'authorization',
      'cookie',
      'x-api-key',
      'x-auth-token',
    ],

    // Maximum body size to capture (default: 10000 bytes)
    maxBodyLength: 10000,

    // Capture request body (default: true)
    captureRequestBody: true,

    // Capture response body (default: true)
    captureResponseBody: true,
  },
});
```

## Configuration Reference

### `ignoreUrls: (string | RegExp)[]`

Array of URL patterns to ignore. Requests matching these patterns will not be captured.

```typescript
ignoreUrls: [
  '/api/analytics',        // Ignore specific path
  'google-analytics.com',  // Ignore domain
  /\.(png|jpg|gif)$/,     // Ignore images
]
```

**Note**: ReplayDash API calls are automatically ignored to prevent infinite loops.

### `sanitizeHeaders: boolean` (default: `true`)

When enabled, sensitive headers are redacted with `[REDACTED]`.

```typescript
sanitizeHeaders: true
// Authorization: Bearer token123  →  Authorization: [REDACTED]
```

### `sensitiveHeaders: string[]`

List of header names to redact (case-insensitive). Default list:

```typescript
[
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'api-key',
  'access-token',
  'refresh-token',
]
```

Add custom headers:

```typescript
sensitiveHeaders: [
  'authorization',
  'x-custom-secret',
  'x-internal-token',
]
```

### `maxBodyLength: number` (default: `10000`)

Maximum number of bytes to capture from request/response bodies. Larger payloads are truncated.

```typescript
maxBodyLength: 5000  // Capture up to 5KB
```

Truncated bodies include a message like:

```
{"data": "..."}... [truncated 15234 chars]
```

### `captureRequestBody: boolean` (default: `true`)

Capture the request body for POST/PUT/PATCH requests.

```typescript
captureRequestBody: false  // Don't capture request bodies
```

### `captureResponseBody: boolean` (default: `true`)

Capture the response body from API calls.

```typescript
captureResponseBody: false  // Don't capture response bodies
```

## Event Data Structure

Network events are stored with the following structure:

```typescript
{
  type: 'network',
  method: 'POST',
  url: 'https://api.example.com/users',
  status: 201,
  statusText: 'Created',
  requestHeaders: {
    'content-type': 'application/json',
    'authorization': '[REDACTED]',
  },
  requestBody: '{"name":"John","email":"john@example.com"}',
  responseHeaders: {
    'content-type': 'application/json',
  },
  responseBody: '{"id":123,"name":"John"}',
  duration: 245,       // milliseconds
  timestamp: 1708789234567,
}
```

For failed requests:

```typescript
{
  type: 'network',
  method: 'GET',
  url: 'https://api.example.com/data',
  status: 0,
  statusText: 'Network Error',
  error: 'Failed to fetch',
  duration: 1234,
  timestamp: 1708789234567,
}
```

## Privacy Best Practices

### 1. Blacklist Sensitive Endpoints

```typescript
ignoreUrls: [
  '/api/auth/login',
  '/api/auth/register',
  '/api/payment',
]
```

### 2. Disable Body Capture for Sensitive Routes

Use conditional initialization or configure per-environment:

```typescript
const isProduction = process.env.NODE_ENV === 'production';

replayDash.init({
  apiKey: 'your-api-key',
  networkConfig: {
    captureRequestBody: !isProduction,
    captureResponseBody: !isProduction,
  },
});
```

### 3. Add Custom Sensitive Headers

```typescript
sensitiveHeaders: [
  'authorization',
  'x-csrf-token',
  'x-user-id',
  'x-session-token',
]
```

### 4. Limit Body Size

```typescript
maxBodyLength: 2000,  // Only capture first 2KB
```

## Dashboard - Network Viewer

The ReplayDash dashboard includes a powerful network viewer:

### Features

- **Timeline View**: See all network requests in chronological order
- **Filter by Method**: GET, POST, PUT, DELETE, etc.
- **Filter by Status**: Success (2xx), Errors (4xx-5xx), Failed (network errors)
- **Search URLs**: Filter requests by URL pattern
- **Request Details**: Click any request to see:
  - Full request/response headers
  - Request body (formatted JSON)
  - Response body (formatted JSON)
  - Timing information
  - Error messages (if failed)

### Workflow

1. Navigate to a session replay
2. Click the **Network** tab
3. Use filters to find specific requests:
   - Search: `api/users`
   - Method: `POST`
   - Status: `error` (4xx-5xx)
4. Click a request to see full details
5. Switch between **Headers**, **Request**, and **Response** tabs

## Use Cases

### Debug Failed API Calls

See exactly what went wrong:
- Which endpoint failed?
- What status code was returned?
- What error message did the server send?

### Reproduce User Issues

"The form submission didn't work" becomes:
- See the exact payload they sent
- Check if validation failed
- Identify missing fields or incorrect data

### Monitor Performance

- Identify slow API calls
- See which endpoints are called most frequently
- Find redundant or duplicate requests

### Validate Integration

- Ensure third-party APIs are called correctly
- Verify authentication headers are sent
- Check API response format matches expectations

## Comparison with Competitors

| Feature | ReplayDash | LogRocket | Sentry | Hotjar |
|---------|-----------|-----------|--------|--------|
| Capture fetch/XHR | ✅ | ✅ | ✅ | ❌ |
| Request/Response Bodies | ✅ | ✅ | ⚠️ Limited | ❌ |
| Header Sanitization | ✅ | ✅ | ✅ | N/A |
| URL Blacklisting | ✅ | ✅ | ✅ | N/A |
| Timeline View | ✅ | ✅ | ✅ | N/A |
| Performance Impact | Low | Medium | Low | N/A |

## Performance Considerations

Network capture has minimal overhead:

- **Interception**: ~1-2ms per request
- **Serialization**: Async, batched with other events
- **Memory**: Requests are sent in batches, not stored locally
- **Bandwidth**: Efficient compression, truncation of large payloads

### Optimization Tips

1. **Ignore Static Assets**: Don't capture images, fonts, CSS
   ```typescript
   ignoreUrls: [/\.(png|jpg|svg|woff|css)$/]
   ```

2. **Limit Body Size**: Use smaller `maxBodyLength` for high-volume apps
   ```typescript
   maxBodyLength: 5000
   ```

3. **Disable in Development**: Only capture in staging/production
   ```typescript
   captureNetwork: process.env.NODE_ENV !== 'development'
   ```

## Troubleshooting

### Network requests not appearing in dashboard

1. **Check if capture is enabled**:
   ```typescript
   captureNetwork: true  // Should be true (or omitted, as it's default)
   ```

2. **Check ignore patterns**:
   - Ensure your URLs aren't matching `ignoreUrls` patterns
   - ReplayDash API calls are automatically ignored

3. **Verify events are being sent**:
   - Open browser console
   - Look for `[ReplayDash]` logs
   - Check Network tab for API calls to `/api/events`

### Request/response bodies are missing

1. **Check body capture settings**:
   ```typescript
   captureRequestBody: true,
   captureResponseBody: true,
   ```

2. **Check content type**:
   - Only JSON and text responses are fully captured
   - Binary content shows as `[Binary content]`

3. **Check body size**:
   - Bodies larger than `maxBodyLength` are truncated
   - Increase limit: `maxBodyLength: 50000`

### Sensitive data is being captured

1. **Add URL to blacklist**:
   ```typescript
   ignoreUrls: ['/api/auth/login']
   ```

2. **Add header to sensitive list**:
   ```typescript
   sensitiveHeaders: ['x-custom-secret']
   ```

3. **Disable body capture**:
   ```typescript
   captureRequestBody: false,
   captureResponseBody: false,
   ```

## Example

See `examples/network-capture/` for a working demo showing:
- Basic network capture setup
- Custom configuration
- Failed request handling
- Dashboard integration

## Next Steps

- [SDK Documentation](./SDK.md)
- [Dashboard Guide](./DASHBOARD.md)
- [Privacy & Security](./PRIVACY.md)
- [API Reference](./API.md)
