# @replaydash/sdk

JavaScript SDK for ReplayDash session recording.

## Installation

```bash
npm install @replaydash/sdk
```

Or via CDN:

```html
<script src="https://cdn.replaydash.com/sdk/v0.1/replaydash.umd.js"></script>
```

## Usage

### Basic Setup

```javascript
import { replayDash } from '@replaydash/sdk';

replayDash.init({
  apiKey: 'your-api-key',
  endpoint: 'https://api.replaydash.com', // optional, defaults to production
  captureConsole: true, // optional, default true
  maskAllInputs: true, // optional, default true
});
```

### Identify Users

```javascript
replayDash.setUser('user-123', 'user@example.com');
```

### Get Session ID

```javascript
const sessionId = replayDash.getSessionId();
console.log('Current session:', sessionId);
```

### Stop Recording

```javascript
replayDash.stop();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | **required** | Your ReplayDash API key |
| `endpoint` | string | `https://api.replaydash.com` | API endpoint URL |
| `sessionSampleRate` | number | `1.0` | Sampling rate (0.0 to 1.0) |
| `captureConsole` | boolean | `true` | Capture console logs |
| `captureNetwork` | boolean | `false` | Capture network requests (future) |
| `maskAllInputs` | boolean | `true` | Mask all input fields |
| `blockSelector` | string | `undefined` | CSS selector for elements to block |
| `ignoreSelector` | string | `undefined` | CSS selector for elements to ignore |

## Features

- ✅ DOM snapshot & mutation recording (via rrweb)
- ✅ Console log capture
- ✅ Error & unhandled rejection capture
- ✅ Automatic session management
- ✅ User identification
- ⏳ Network request capture (coming soon)
- ⏳ Custom event tracking (coming soon)

## License

MIT
