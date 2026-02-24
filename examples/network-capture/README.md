# Network Capture Example

This example demonstrates ReplayDash's network capture capabilities by showing how to:

- Capture `fetch()` and `XMLHttpRequest` calls
- Handle successful requests (2xx)
- Capture failed requests (4xx, 5xx)
- Track network errors
- Sanitize sensitive headers
- Configure URL blacklisting
- View captured requests in the dashboard

## Running the Example

### 1. Build the SDK

```bash
cd packages/sdk
npm run build
```

### 2. Start the API Server

```bash
cd packages/api
npm run dev
```

The API should be running on `http://localhost:3001`.

### 3. Open the Example

Open `examples/network-capture/index.html` in your browser. You can use a simple HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then navigate to: `http://localhost:8000/examples/network-capture/`

### 4. View in Dashboard

Start the dashboard:

```bash
cd packages/dashboard
npm run dev
```

Navigate to `http://localhost:3000` and find your session to see captured network requests.

## What's Happening?

### On Page Load

1. ReplayDash SDK initializes with network capture enabled
2. A session ID is generated and displayed
3. An automatic test request is made to demonstrate capture

### Interactive Tests

Click the buttons to trigger different types of requests:

- **Successful GET**: Fetches data from JSONPlaceholder API
- **POST with Data**: Sends data with headers (Authorization header is sanitized)
- **404 Not Found**: Requests a non-existent resource
- **500 Server Error**: Triggers a server error response
- **Network Error**: Attempts to reach an invalid domain
- **Slow Request**: Makes a request with 3-second delay
- **Form Submit**: Sends form data via POST

### What Gets Captured

For each request, ReplayDash captures:

✅ **Request Data**
- HTTP method (GET, POST, etc.)
- Full URL
- Request headers (sensitive ones sanitized)
- Request body (for POST/PUT/PATCH)

✅ **Response Data**
- HTTP status code and text
- Response headers
- Response body (truncated if large)

✅ **Timing**
- Request start time
- Duration in milliseconds

✅ **Errors**
- Network errors
- HTTP error responses
- Error messages

## Configuration Highlights

```javascript
networkConfig: {
  // Ignore image files and analytics
  ignoreUrls: [
    /\.(png|jpg|jpeg|gif|svg|ico)$/,
    'google-analytics.com',
  ],
  
  // Sanitize sensitive headers (Authorization header in demo)
  sanitizeHeaders: true,
  sensitiveHeaders: ['authorization', 'x-api-key', 'cookie'],
  
  // Limit body size to 10KB
  maxBodyLength: 10000,
  
  // Capture both request and response bodies
  captureRequestBody: true,
  captureResponseBody: true,
}
```

## Dashboard Features

In the ReplayDash dashboard, you can:

1. **View Timeline**: See all requests in chronological order
2. **Filter by Method**: GET, POST, PUT, DELETE, etc.
3. **Filter by Status**: Success (2xx), Errors (4xx-5xx), Failed
4. **Search URLs**: Find specific endpoints
5. **View Details**: Click any request to see:
   - Request/response headers
   - Request/response bodies (formatted JSON)
   - Error messages
   - Timing information

## Privacy & Security

This example demonstrates privacy features:

- **Header Sanitization**: The `Authorization: Bearer secret-token-12345` header is automatically redacted to `[REDACTED]`
- **URL Blacklisting**: Image files and analytics domains are ignored
- **Body Truncation**: Large payloads are truncated to prevent data overload

## Debugging Workflow

1. **Reproduce the issue**: Navigate through the app, trigger the bug
2. **Find the session**: Go to ReplayDash dashboard, locate your session
3. **Check Network tab**: See all API calls made during the session
4. **Identify failures**: Filter by error status codes or network failures
5. **Inspect details**: View the exact request/response that caused the issue
6. **Fix the bug**: You now have all the data you need!

## Next Steps

- Read the [Network Capture Documentation](../../docs/NETWORK_CAPTURE.md)
- Explore other examples
- Integrate ReplayDash into your own app
