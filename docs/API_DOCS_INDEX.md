# ReplayDash API Documentation Index

Complete guide to the ReplayDash API documentation.

## 📚 Documentation Structure

```
docs/api/
├── 📄 index.html                   # Interactive Swagger UI (START HERE)
├── 📄 openapi.json                 # OpenAPI 3.0 spec (JSON format)
├── 📄 openapi.yaml                 # OpenAPI 3.0 spec (YAML format)
│
├── 📖 README.md                    # Complete API guide with code examples
├── 🚀 QUICKSTART.md                # Quick start guide (5-minute setup)
├── 🔧 UPDATING.md                  # How to update documentation
├── 🌐 DEPLOYMENT.md                # How to deploy documentation
├── ✅ COMPLETION_SUMMARY.md        # Project completion summary
│
├── 🛠️  serve.js                    # Local documentation server
└── 📦 package.json                 # npm scripts for doc management
```

## 🎯 Quick Navigation

### For Developers Using the API

1. **[QUICKSTART.md](./api/QUICKSTART.md)** - Get started in 5 minutes
2. **[README.md](./api/README.md)** - Complete API reference with examples
3. **[index.html](./api/index.html)** - Interactive documentation (Swagger UI)

### For Maintainers

1. **[UPDATING.md](./api/UPDATING.md)** - How to update docs
2. **[DEPLOYMENT.md](./api/DEPLOYMENT.md)** - How to deploy docs
3. **[COMPLETION_SUMMARY.md](./api/COMPLETION_SUMMARY.md)** - Implementation details

### For Integration

1. **[openapi.json](./api/openapi.json)** - Import into tools (Postman, Insomnia)
2. **[openapi.yaml](./api/openapi.yaml)** - Import into tools (YAML format)

## 🚀 Getting Started (3 Options)

### Option 1: Via API Server (Best for Development)

```bash
cd packages/api
npm run dev
# Visit: http://localhost:3001/api/docs
```

✅ Always up-to-date with code  
✅ Can test endpoints directly  
✅ See real-time API responses

### Option 2: Static Server (Best for Quick Reference)

```bash
cd docs/api
node serve.js
# Visit: http://localhost:8080
```

✅ Fast startup  
✅ No API dependencies  
✅ Offline capable

### Option 3: Direct File (Best for Offline)

```bash
open docs/api/index.html
```

✅ No server needed  
✅ Works anywhere  
✅ Instant access

## 📖 Documentation Files Explained

### Core Documentation

#### index.html (3 KB)
Interactive Swagger UI documentation with:
- Try it out functionality
- Request/response examples
- Authentication testing
- Beautiful, responsive design

**When to use:**
- Testing API endpoints
- Learning the API interactively
- Sharing with developers

#### openapi.json (14.5 KB)
Complete OpenAPI 3.0 specification in JSON format.

**When to use:**
- Import into API tools (Postman, Insomnia)
- Generate client libraries
- API testing automation
- CI/CD integration

#### openapi.yaml (10.5 KB)
Complete OpenAPI 3.0 specification in YAML format.

**When to use:**
- Human-readable spec viewing
- Version control (more readable diffs)
- Documentation generation
- API design discussions

### Guides

#### README.md (16 KB)
Comprehensive API guide including:
- All endpoints documented
- Code examples in 6 languages
- Authentication guide
- Security best practices
- Rate limits
- Error handling

**When to use:**
- Learning the API
- Copy-paste code examples
- Understanding authentication
- Troubleshooting errors

#### QUICKSTART.md (4.8 KB)
5-minute quick start guide.

**When to use:**
- First time setup
- Common tasks reference
- Quick troubleshooting

#### UPDATING.md (9.3 KB)
Complete guide for updating documentation.

**When to use:**
- Adding new endpoints
- Modifying existing docs
- Regenerating spec files
- Testing documentation changes

#### DEPLOYMENT.md (11 KB)
Deployment guide for 6 platforms.

**When to use:**
- Deploying to production
- Setting up CI/CD
- Choosing hosting platform
- Configuring security

#### COMPLETION_SUMMARY.md (13 KB)
Project completion summary and implementation details.

**When to use:**
- Understanding what was built
- Reviewing requirements
- Onboarding new team members
- Project documentation

### Utilities

#### serve.js (2 KB)
Simple Node.js HTTP server for local documentation.

**How to use:**
```bash
node serve.js [port]
# Default port: 8080
```

#### package.json (552 B)
npm scripts for documentation management.

**Available scripts:**
```bash
npm run serve         # Start documentation server
npm run validate      # Validate OpenAPI spec
npm run convert:yaml  # Convert JSON to YAML
npm run convert:json  # Convert YAML to JSON
```

## 🔑 Key Features

### Interactive Documentation
- ✅ Try it out functionality
- ✅ Authentication testing
- ✅ Request/response examples
- ✅ Error responses
- ✅ Code generation

### Code Examples
Provided in 6 languages:
1. JavaScript (Fetch API)
2. JavaScript (Axios)
3. TypeScript
4. cURL
5. Python
6. Node.js

### Complete Coverage
- ✅ 4/4 endpoints documented
- ✅ All request schemas
- ✅ All response schemas
- ✅ All error codes
- ✅ Authentication

## 📋 Common Tasks

### View Documentation

**Interactive (Swagger UI):**
```bash
cd packages/api && npm run dev
# Visit: http://localhost:3001/api/docs
```

**Static:**
```bash
cd docs/api && node serve.js
# Visit: http://localhost:8080
```

### Update Documentation

1. Add Swagger decorators to code
2. Start API server
3. Spec auto-generates

See [UPDATING.md](./api/UPDATING.md) for details.

### Validate Specification

```bash
cd docs/api
npm install  # First time only
npm run validate
```

### Deploy Documentation

**Quick deploy:**
```bash
cd docs/api
npx vercel --prod
```

See [DEPLOYMENT.md](./api/DEPLOYMENT.md) for all options.

### Test Endpoints

**In Swagger UI:**
1. Click "Authorize"
2. Enter your API key
3. Click "Try it out" on any endpoint
4. Execute and view response

**With cURL:**
```bash
curl -H "x-api-key: YOUR_KEY" \
  http://localhost:3001/api/v1/sessions
```

## 🛠️ For Developers

### Adding a New Endpoint

1. **Create controller with decorators:**
```typescript
@ApiTags('my-feature')
@ApiSecurity('api-key')
@Controller('api/v1/my-endpoint')
export class MyController {
  @Get()
  @ApiOperation({ summary: 'List items' })
  @ApiResponse({ status: 200, description: 'Success' })
  async list() {
    // Implementation
  }
}
```

2. **Add DTO with properties:**
```typescript
export class MyDto {
  @ApiProperty({
    description: 'Field description',
    example: 'example value',
  })
  field!: string;
}
```

3. **Regenerate docs:**
```bash
npm run dev  # Spec auto-generates
```

See full guide: [UPDATING.md](./api/UPDATING.md)

### Testing Your Changes

1. Start API: `npm run dev`
2. Visit: http://localhost:3001/api/docs
3. Test endpoint with "Try it out"
4. Verify examples work
5. Check response schemas

## 🌐 For DevOps

### Deployment Options

1. **API Server** - Built-in at `/api/docs`
2. **GitHub Pages** - Free static hosting
3. **Vercel** - Serverless deployment
4. **Netlify** - CDN hosting
5. **AWS S3 + CloudFront** - Enterprise scale
6. **Dashboard Integration** - Embedded docs

See full guide: [DEPLOYMENT.md](./api/DEPLOYMENT.md)

### CI/CD Integration

Auto-deploy on API changes:

```yaml
- name: Generate docs
  run: |
    cd packages/api
    npm run docs:generate
    
- name: Deploy
  run: |
    cd docs/api
    vercel --prod
```

## 📚 Resources

### Internal Documentation
- [README.md](./api/README.md) - Complete API guide
- [QUICKSTART.md](./api/QUICKSTART.md) - Quick start
- [UPDATING.md](./api/UPDATING.md) - Update guide
- [DEPLOYMENT.md](./api/DEPLOYMENT.md) - Deployment guide

### External Resources
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

### Tools
- [Swagger Editor](https://editor.swagger.io/) - Online spec editor
- [Postman](https://www.postman.com/) - API testing
- [Insomnia](https://insomnia.rest/) - API client

## 🆘 Troubleshooting

### Documentation not updating

**Solution:**
```bash
cd packages/api
rm -rf dist/
npm run build
npm run dev
```

### Server won't start

**Solution:**
```bash
# Kill any process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### TypeScript errors

**Solution:**
```bash
cd packages/api
npx prisma generate
npm run build
```

### Can't validate spec

**Solution:**
```bash
cd docs/api
npm install
npm run validate
```

## ✅ Checklist

Before deploying:

- [ ] All endpoints documented
- [ ] Code examples tested
- [ ] OpenAPI spec validated
- [ ] Interactive docs tested
- [ ] Authentication works
- [ ] Links verified
- [ ] Mobile responsive
- [ ] Security reviewed

## 🎯 Next Steps

1. ✅ **Review the docs**
   - Open index.html
   - Test endpoints
   - Verify examples

2. ✅ **Share with team**
   - Send QUICKSTART.md
   - Demo Swagger UI
   - Explain update process

3. ✅ **Deploy to production**
   - Choose deployment method
   - Set up CI/CD
   - Configure domain

4. ✅ **Maintain documentation**
   - Update when API changes
   - Add new examples
   - Keep guides current

## 📞 Support

Need help?

- 📖 Read the guides in `docs/api/`
- 💬 Create a GitHub issue
- 📧 Contact support@replaydash.com

---

**API Documentation is ready! 🎉**

Start here: [QUICKSTART.md](./api/QUICKSTART.md)
