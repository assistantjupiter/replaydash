# SDK Integration Guide

How to integrate the ReplayDash SDK into your application.

## Installation

### NPM/Yarn

```bash
npm install @replaydash/sdk
# or
yarn add @replaydash/sdk
```

### CDN

```html
<script src="https://cdn.replaydash.com/sdk/v0.1/replaydash.umd.js"></script>
```

## Basic Usage

### ES Modules

```javascript
import { replayDash } from '@replaydash/sdk';

replayDash.init({
  apiKey: 'your-api-key',
  endpoint: 'https://api.replaydash.com', // optional
});
```

### CommonJS

```javascript
const { replayDash } = require('@replaydash/sdk');

replayDash.init({
  apiKey: 'your-api-key',
});
```

### UMD (Browser Global)

```html
<script src="https://cdn.replaydash.com/sdk/latest/replaydash.umd.js"></script>
<script>
  ReplayDash.replayDash.init({
    apiKey: 'your-api-key',
  });
</script>
```

## Configuration Options

```typescript
interface ReplayDashConfig {
  apiKey: string;              // Required: Your API key
  endpoint?: string;           // Optional: API endpoint (default: production)
  sessionSampleRate?: number;  // Optional: 0.0 to 1.0 (default: 1.0)
  captureConsole?: boolean;    // Optional: Capture console logs (default: true)
  captureNetwork?: boolean;    // Optional: Capture network requests (default: false, future)
  maskAllInputs?: boolean;     // Optional: Mask all input fields (default: true)
  blockSelector?: string;      // Optional: CSS selector for elements to block
  ignoreSelector?: string;     // Optional: CSS selector for elements to ignore
}
```

### Examples

#### Mask Specific Elements

```javascript
replayDash.init({
  apiKey: 'your-api-key',
  blockSelector: '.sensitive-data', // Completely block these elements
  ignoreSelector: '.ignore-changes', // Ignore mutations in these elements
});
```

#### Disable Console Capture

```javascript
replayDash.init({
  apiKey: 'your-api-key',
  captureConsole: false,
});
```

#### Sample 50% of Sessions

```javascript
replayDash.init({
  apiKey: 'your-api-key',
  sessionSampleRate: 0.5, // Record only 50% of sessions
});
```

## User Identification

Identify users after authentication:

```javascript
// Set user ID only
replayDash.setUser('user-123');

// Set user ID and email
replayDash.setUser('user-123', 'user@example.com');
```

## React Integration

### App Component

```typescript
import { useEffect } from 'react';
import { replayDash } from '@replaydash/sdk';

function App() {
  useEffect(() => {
    replayDash.init({
      apiKey: process.env.REACT_APP_REPLAYDASH_API_KEY!,
      endpoint: process.env.REACT_APP_REPLAYDASH_ENDPOINT,
    });

    return () => {
      replayDash.stop();
    };
  }, []);

  return <YourApp />;
}
```

### Hook for User Identification

```typescript
import { useEffect } from 'react';
import { replayDash } from '@replaydash/sdk';

export function useReplayDashUser(user: { id: string; email?: string } | null) {
  useEffect(() => {
    if (user) {
      replayDash.setUser(user.id, user.email);
    }
  }, [user]);
}
```

## Next.js Integration

### _app.tsx

```typescript
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { replayDash } from '@replaydash/sdk';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      replayDash.init({
        apiKey: process.env.NEXT_PUBLIC_REPLAYDASH_API_KEY!,
        endpoint: process.env.NEXT_PUBLIC_REPLAYDASH_ENDPOINT,
      });
    }
  }, []);

  return <Component {...pageProps} />;
}
```

## Vue Integration

```typescript
import { createApp } from 'vue';
import { replayDash } from '@replaydash/sdk';
import App from './App.vue';

replayDash.init({
  apiKey: import.meta.env.VITE_REPLAYDASH_API_KEY,
});

const app = createApp(App);
app.mount('#app');
```

## Angular Integration

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { replayDash } from '@replaydash/sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  ngOnInit() {
    replayDash.init({
      apiKey: environment.replayDashApiKey,
    });
  }

  ngOnDestroy() {
    replayDash.stop();
  }
}
```

## Privacy & Security

### Masking Sensitive Data

By default, all input fields are masked. To unmask specific inputs:

```html
<input type="text" class="rr-unmask" />
```

To block entire sections:

```html
<div class="rr-block">
  <!-- This entire section won't be recorded -->
</div>
```

### Custom Masking Rules

```javascript
replayDash.init({
  apiKey: 'your-api-key',
  maskAllInputs: true,
  blockSelector: '.credit-card, .ssn, .password',
  ignoreSelector: '.public-data',
});
```

## Performance Tips

1. **Sampling**: Use `sessionSampleRate` in production to reduce load
2. **Selective Recording**: Use `blockSelector` to skip heavy DOM sections
3. **Stop Recording**: Call `replayDash.stop()` when no longer needed

## API Methods

### `init(config: ReplayDashConfig): void`
Initialize and start recording.

### `setUser(userId: string, userEmail?: string): void`
Identify the current user.

### `getSessionId(): string | null`
Get the current session ID.

### `stop(): void`
Stop recording and clean up.

## Troubleshooting

### Events Not Showing Up

1. Check API key is correct
2. Verify endpoint is reachable
3. Check browser console for errors
4. Look for network requests to `/api/v1/events`

### High Memory Usage

- Reduce `sessionSampleRate`
- Use `blockSelector` to skip large DOM sections
- Call `stop()` when recording isn't needed

### Recording Not Starting

- Verify `replayDash.init()` is called after DOM is ready
- Check for console errors
- Ensure rrweb is loaded correctly

## Support

- Documentation: https://docs.replaydash.com
- Issues: https://github.com/replaydash/replaydash/issues
- Email: support@replaydash.com
