# API Documentation Deployment Guide

This guide explains how to deploy and host the ReplayDash API documentation.

## 📦 Deployment Options

### Option 1: Integrated with API Server (Recommended)

The documentation is automatically served by the NestJS API at `/api/docs`.

**Setup:**

Documentation is already configured in `packages/api/src/main.ts`:

```typescript
SwaggerModule.setup('api/docs', app, document);
```

**Access:**
- Local: `http://localhost:3001/api/docs`
- Production: `https://api.replaydash.com/api/docs`

**Pros:**
- Always in sync with API
- No separate deployment needed
- Dynamic spec generation

**Cons:**
- Requires API server to be running
- Can't view docs offline

---

### Option 2: Static Site (GitHub Pages)

Host the documentation as a static site on GitHub Pages.

**Setup:**

1. Enable GitHub Pages in repository settings
2. Set source to `docs` folder
3. Documentation will be available at:
   - `https://yourusername.github.io/replaydash/api/`

**Automated Deployment:**

Add this GitHub Action (`.github/workflows/docs.yml`):

```yaml
name: Deploy API Docs

on:
  push:
    branches: [main]
    paths:
      - 'docs/api/**'
      - 'packages/api/src/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd packages/api
          npm install
      
      - name: Build API
        run: |
          cd packages/api
          npm run build
      
      - name: Generate OpenAPI spec
        run: |
          cd packages/api
          npm start &
          sleep 5
          pkill -f "node dist/main"
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/api
```

**Pros:**
- Free hosting
- CDN distribution
- Version control
- Easy rollbacks

**Cons:**
- Requires manual deployment or CI/CD
- May be out of sync with API

---

### Option 3: Vercel

Deploy documentation as a serverless site on Vercel.

**Setup:**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create `vercel.json` in `docs/api/`:
   ```json
   {
     "version": 2,
     "name": "replaydash-api-docs",
     "builds": [
       {
         "src": "*.html",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```

3. Deploy:
   ```bash
   cd docs/api
   vercel --prod
   ```

**Automated Deployment:**

Link to your Git repository and enable automatic deployments.

**Pros:**
- Easy deployment
- Automatic HTTPS
- Custom domains
- Instant rollbacks
- Preview deployments for PRs

**Cons:**
- Requires Vercel account
- May have costs at scale

---

### Option 4: Netlify

Deploy on Netlify for fast, global CDN hosting.

**Setup:**

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Create `netlify.toml` in `docs/api/`:
   ```toml
   [build]
     publish = "."
     command = "echo 'No build step required'"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. Deploy:
   ```bash
   cd docs/api
   netlify deploy --prod
   ```

**Automated Deployment:**

Connect your Git repository and enable automatic deployments.

**Pros:**
- Generous free tier
- Easy to use
- Instant cache invalidation
- Form handling
- Split testing

**Cons:**
- Requires Netlify account
- May have costs at scale

---

### Option 5: AWS S3 + CloudFront

Deploy to AWS for enterprise-grade hosting.

**Setup:**

1. Create S3 bucket:
   ```bash
   aws s3 mb s3://replaydash-api-docs
   ```

2. Enable static website hosting:
   ```bash
   aws s3 website s3://replaydash-api-docs \
     --index-document index.html
   ```

3. Upload files:
   ```bash
   cd docs/api
   aws s3 sync . s3://replaydash-api-docs --acl public-read
   ```

4. Create CloudFront distribution:
   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name replaydash-api-docs.s3.amazonaws.com
   ```

**Pros:**
- Highly scalable
- Global CDN
- Advanced caching
- Integration with AWS services

**Cons:**
- More complex setup
- AWS account required
- Cost considerations

---

### Option 6: Embedded in Dashboard

Integrate the documentation into the ReplayDash dashboard.

**Setup:**

1. Copy docs to dashboard public folder:
   ```bash
   cp -r docs/api packages/dashboard/public/docs/api
   ```

2. Add route in dashboard (Next.js):
   ```typescript
   // pages/docs/api/[[...slug]].tsx
   import { useRouter } from 'next/router';
   import { useEffect } from 'react';

   export default function ApiDocs() {
     const router = useRouter();
     
     useEffect(() => {
       // Redirect to static docs
       window.location.href = '/docs/api/index.html';
     }, []);

     return <div>Loading API documentation...</div>;
   }
   ```

3. Add navigation link:
   ```typescript
   // components/Navigation.tsx
   <Link href="/docs/api">
     API Documentation
   </Link>
   ```

**Pros:**
- Single deployment
- Unified experience
- Authentication integration possible
- Same domain

**Cons:**
- Increases dashboard bundle size
- Couples docs to dashboard releases

---

## 🔄 Continuous Deployment

### Automatic Spec Generation

Add this npm script to `packages/api/package.json`:

```json
{
  "scripts": {
    "docs:generate": "ts-node scripts/generate-docs.ts"
  }
}
```

Create `packages/api/scripts/generate-docs.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateDocs() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('ReplayDash API')
    .setDescription('Session replay and user analytics API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const docsDir = path.join(__dirname, '../../../docs/api');
  fs.writeFileSync(
    path.join(docsDir, 'openapi.json'),
    JSON.stringify(document, null, 2)
  );

  console.log('✅ OpenAPI spec generated successfully');
  process.exit(0);
}

generateDocs();
```

### Pre-commit Hook

Add this to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Regenerate API docs if API code changed
if git diff --cached --name-only | grep -q "^packages/api/src/"; then
  echo "🔄 Regenerating API documentation..."
  cd packages/api
  npm run docs:generate
  git add ../../docs/api/openapi.json
fi
```

### GitHub Actions Workflow

Complete workflow for automatic documentation deployment:

```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate OpenAPI spec
        run: |
          cd packages/api
          npm run docs:generate
      
      - name: Validate OpenAPI spec
        run: |
          cd docs/api
          npm install
          npm run validate
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: api-docs
          path: docs/api/

  deploy-vercel:
    needs: generate
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: api-docs
          path: docs/api/
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: docs/api
          vercel-args: '--prod'
```

---

## 🔒 Security Considerations

### API Key Protection

When deploying documentation:

1. **Remove example API keys** from examples
2. **Use placeholders** like `your_api_key_here`
3. **Don't commit** real API keys to Git

### CORS Configuration

If hosting docs separately from API:

```typescript
// packages/api/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://replaydash.com',
    'https://docs.replaydash.com',
    'https://yourusername.github.io',
  ],
  credentials: true,
});
```

### Rate Limiting

Protect the documentation endpoint:

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
export class AppModule {}
```

---

## 📊 Analytics

Track documentation usage with analytics:

### Google Analytics

Add to `docs/api/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics (Privacy-friendly)

```html
<script defer data-domain="docs.replaydash.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🧪 Testing Deployment

Before deploying to production:

1. **Validate spec:**
   ```bash
   cd docs/api
   npm run validate
   ```

2. **Test locally:**
   ```bash
   cd docs/api
   npm run serve
   # Open http://localhost:8080
   ```

3. **Test all endpoints** in Swagger UI

4. **Verify code examples** work

5. **Check responsive design** on mobile

6. **Test CORS** if hosting separately

---

## 📝 Checklist

Before deploying documentation:

- [ ] OpenAPI spec is up-to-date
- [ ] All endpoints documented
- [ ] Code examples tested
- [ ] Links verified
- [ ] Spec validated
- [ ] Responsive design tested
- [ ] Analytics configured
- [ ] CORS configured (if needed)
- [ ] Security reviewed
- [ ] Backup of previous version

---

## 🆘 Troubleshooting

### Docs not loading

- Check file paths are correct
- Verify CORS settings
- Check browser console for errors
- Validate OpenAPI spec

### Swagger UI errors

- Ensure `openapi.json` is valid JSON
- Check Swagger UI version compatibility
- Verify CDN links are accessible

### Deployment failures

- Check deployment logs
- Verify credentials/tokens
- Ensure build succeeds locally first
- Check file permissions

---

## 📚 Resources

- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Pages Guide](https://pages.github.com/)
