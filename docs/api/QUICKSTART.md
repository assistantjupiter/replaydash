# API Documentation Quick Start

Get the ReplayDash API documentation up and running in minutes.

## 🚀 View Documentation (3 Ways)

### 1. Via API Server (Easiest)

Start the API server and visit the built-in docs:

```bash
cd /Users/jupiter/Projects/replaydash/packages/api
npm run dev
```

Then open: **http://localhost:3001/api/docs**

✅ Best for: Active development, always up-to-date

---

### 2. Static Documentation (Fastest)

Serve the pre-generated documentation locally:

```bash
cd /Users/jupiter/Projects/replaydash/docs/api
node serve.js
```

Then open: **http://localhost:8080**

✅ Best for: Offline viewing, quick reference

---

### 3. Open HTML File (Simplest)

Just open the file in your browser:

```bash
open /Users/jupiter/Projects/replaydash/docs/api/index.html
```

✅ Best for: One-off viewing, no server needed

---

## 📝 Common Tasks

### Update Documentation After Code Changes

1. **Add Swagger decorators to your controller:**

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('my-feature')
@Controller('api/v1/my-feature')
export class MyFeatureController {
  @Get()
  @ApiOperation({ summary: 'List items' })
  @ApiResponse({ status: 200, description: 'Success' })
  async list() {
    // ...
  }
}
```

2. **Regenerate the spec:**

```bash
cd packages/api
npm run dev
# Spec is auto-generated at startup to docs/api/openapi.json
```

3. **View updated docs:**

Open http://localhost:3001/api/docs

---

### Add a New Endpoint

1. Create controller with Swagger decorators
2. Create DTO with `@ApiProperty` decorators
3. Start the API (`npm run dev`)
4. Docs update automatically

See [UPDATING.md](./UPDATING.md) for detailed instructions.

---

### Validate OpenAPI Spec

```bash
cd docs/api
npm install  # First time only
npm run validate
```

---

### Convert Between JSON and YAML

```bash
cd docs/api
npm install  # First time only

# JSON → YAML
npm run convert:yaml

# YAML → JSON
npm run convert:json
```

---

### Deploy Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide.

**Quick deploy to Vercel:**

```bash
cd docs/api
npx vercel --prod
```

---

## 🔑 Using the API

### Get Your API Key

1. Start the API and dashboard
2. Visit http://localhost:3000
3. Go to Settings → API Keys
4. Create a new API key

### Make Your First Request

```bash
# List sessions
curl -H "x-api-key: your_api_key_here" \
  http://localhost:3001/api/v1/sessions

# Ingest events
curl -X POST http://localhost:3001/api/v1/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key_here" \
  -d '{
    "sessionId": "test-session-123",
    "timestamp": 1708777200000,
    "events": [
      {
        "type": "rrweb/full-snapshot",
        "timestamp": 1708777200000,
        "data": {}
      }
    ]
  }'
```

### Use in JavaScript

```javascript
const response = await fetch('http://localhost:3001/api/v1/sessions', {
  headers: {
    'x-api-key': 'your_api_key_here'
  }
});

const data = await response.json();
console.log(data);
```

See [README.md](./README.md) for more code examples.

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `index.html` | Interactive Swagger UI documentation |
| `openapi.json` | OpenAPI 3.0 specification (JSON) |
| `openapi.yaml` | OpenAPI 3.0 specification (YAML) |
| `README.md` | API guide with code examples |
| `UPDATING.md` | How to update documentation |
| `DEPLOYMENT.md` | How to deploy documentation |
| `serve.js` | Local documentation server |

---

## 🆘 Troubleshooting

### "Cannot find module" errors

```bash
cd packages/api
npm install
```

### TypeScript build errors

```bash
cd packages/api
npx prisma generate  # Regenerate Prisma client
npm run build
```

### Port already in use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev
```

### Documentation not updating

1. Stop the API server (Ctrl+C)
2. Delete `packages/api/dist` folder
3. Rebuild: `npm run build`
4. Restart: `npm run dev`

---

## 🎯 Next Steps

1. ✅ View the documentation
2. ✅ Get your API key
3. ✅ Make test requests
4. ✅ Read the full [API guide](./README.md)
5. ✅ Integrate into your app

---

## 💡 Tips

- **Use the "Try it out" button** in Swagger UI to test endpoints
- **Copy the cURL commands** from Swagger UI for your terminal
- **Enable "Authorize"** in Swagger UI to save your API key
- **Bookmark** http://localhost:3001/api/docs for quick access
- **Check the console** in Swagger UI for request/response details

---

## 📞 Need Help?

- 📖 [Full API Documentation](./README.md)
- 🔧 [Updating Guide](./UPDATING.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 💬 [GitHub Issues](https://github.com/yourusername/replaydash/issues)

---

**Ready to build? Happy coding! 🎉**
