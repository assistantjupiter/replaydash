# Updating API Documentation

This guide explains how to keep the ReplayDash API documentation up-to-date.

## 📝 Overview

The API documentation is generated from Swagger/OpenAPI decorators in the NestJS code. The documentation consists of:

1. **Swagger decorators** in the API controllers and DTOs
2. **OpenAPI spec files** (`openapi.json` and `openapi.yaml`)
3. **Interactive documentation** (`index.html`)
4. **README with examples** (`README.md`)

## 🔄 Automatic Updates (Recommended)

The OpenAPI spec is automatically generated when the API starts. To update the documentation:

### 1. Update Controller Decorators

When adding or modifying endpoints, update the Swagger decorators in your controllers:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@ApiTags('your-tag')
@ApiSecurity('api-key')
@Controller('api/v1/your-endpoint')
export class YourController {
  @Get()
  @ApiOperation({
    summary: 'Brief description',
    description: 'Detailed description of what this endpoint does',
  })
  @ApiResponse({
    status: 200,
    description: 'Success response description',
    schema: {
      type: 'object',
      properties: {
        // Define your response schema
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing API key',
  })
  async yourMethod() {
    // Implementation
  }
}
```

### 2. Update DTOs with Property Decorators

Add `@ApiProperty` decorators to all DTO fields:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class YourDto {
  @ApiProperty({
    description: 'Field description',
    example: 'example value',
  })
  requiredField!: string;

  @ApiPropertyOptional({
    description: 'Optional field description',
    example: 'example value',
  })
  optionalField?: string;
}
```

### 3. Generate Updated Spec

The spec is automatically generated when you start the API:

```bash
cd packages/api
npm run dev
```

The generated spec will be written to:
- `docs/api/openapi.json`

The interactive docs will be available at:
- `http://localhost:3001/api/docs`

### 4. Convert JSON to YAML (Optional)

If you need the YAML version, you can convert it:

```bash
# Using online converter or CLI tools
npx swagger-cli bundle docs/api/openapi.json -o docs/api/openapi.yaml -t yaml
```

Or use the provided script:

```bash
npm run docs:convert
```

## 🖊️ Manual Updates

### Updating the OpenAPI Spec Directly

If you need to make manual changes to the OpenAPI spec:

1. Edit `docs/api/openapi.json` or `docs/api/openapi.yaml`
2. Validate the spec:

```bash
npx swagger-cli validate docs/api/openapi.json
```

3. Test in the interactive docs by opening `docs/api/index.html`

### Updating Code Examples

To update code examples in the README:

1. Edit `docs/api/README.md`
2. Update the relevant code examples
3. Test the examples to ensure they work
4. Commit the changes

## 🏗️ Adding New Endpoints

When adding a new endpoint, follow these steps:

### 1. Create the Controller

```typescript
// src/your-module/your.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { YourDto } from './dto/your.dto';

@ApiTags('your-module')
@ApiSecurity('api-key')
@Controller('api/v1/your-endpoint')
@UseGuards(ApiKeyGuard)
export class YourController {
  @Post()
  @ApiOperation({
    summary: 'Create something',
    description: 'Detailed description',
  })
  @ApiBody({ type: YourDto })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: YourDto) {
    // Implementation
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get by ID',
    description: 'Retrieve a specific item',
  })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Item found' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getById(@Param('id') id: string) {
    // Implementation
  }
}
```

### 2. Create the DTO

```typescript
// src/your-module/dto/your.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class YourDto {
  @ApiProperty({
    description: 'Required field',
    example: 'example value',
  })
  @IsString()
  requiredField!: string;

  @ApiPropertyOptional({
    description: 'Optional field',
    example: 'optional value',
  })
  @IsOptional()
  @IsString()
  optionalField?: string;
}
```

### 3. Update main.ts Tags (Optional)

Add the new tag to the Swagger config in `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  // ... existing config
  .addTag('your-module', 'Description of your module')
  .build();
```

### 4. Regenerate Documentation

```bash
cd packages/api
npm run build
npm run dev
```

The new endpoint will appear in the documentation at `http://localhost:3001/api/docs`

### 5. Add Code Examples to README

Update `docs/api/README.md` with examples for the new endpoint:

```markdown
### Your New Endpoint

Description of what it does.

**Endpoint:** `POST /api/v1/your-endpoint`

**Request Body:**

\`\`\`json
{
  "requiredField": "value",
  "optionalField": "value"
}
\`\`\`

**Response:**

\`\`\`json
{
  "id": "123",
  "requiredField": "value"
}
\`\`\`

**Code Example:**

\`\`\`javascript
// JavaScript example
\`\`\`

\`\`\`bash
# cURL example
\`\`\`
```

## 🧪 Testing Documentation

Before committing documentation changes:

1. **Validate OpenAPI spec:**

```bash
npx swagger-cli validate docs/api/openapi.json
```

2. **Test interactive docs:**

Open `docs/api/index.html` in a browser and verify:
- All endpoints are displayed
- Examples work correctly
- Authentication works
- Response schemas are accurate

3. **Test code examples:**

Run the code examples in the README to ensure they work:

```bash
# Test cURL examples
# Test JavaScript examples in Node.js
# Test Python examples
```

4. **Check links:**

Verify all links in the documentation work:
- Internal links to other sections
- External links to resources
- Download links for spec files

## 📦 Deployment

### Deploying to GitHub Pages

The documentation can be hosted on GitHub Pages:

1. Push the docs to your repository
2. Enable GitHub Pages in repository settings
3. Set the source to the `docs` folder
4. Access at `https://yourusername.github.io/replaydash/api/`

### Deploying with the Dashboard

The documentation can be integrated into the main dashboard:

1. Copy `docs/api/*` to `packages/dashboard/public/docs/api/`
2. Add a link in the dashboard navigation
3. Deploy the dashboard with the embedded docs

### Deploying as Static Site

Deploy the documentation as a standalone static site:

```bash
# Using Vercel
vercel docs/api

# Using Netlify
netlify deploy --dir=docs/api

# Using GitHub Pages
git subtree push --prefix docs/api origin gh-pages
```

## 🔧 Troubleshooting

### Issue: OpenAPI spec not generating

**Solution:** Make sure all decorators are properly imported and the API starts without errors:

```bash
cd packages/api
npm run build
npm run dev
```

Check the console for any TypeScript or runtime errors.

### Issue: Examples not appearing in Swagger UI

**Solution:** Ensure examples are defined in the `@ApiBody` decorator:

```typescript
@ApiBody({
  type: YourDto,
  examples: {
    basic: {
      summary: 'Basic example',
      value: {
        field: 'value'
      }
    }
  }
})
```

### Issue: Response schemas missing

**Solution:** Add response schemas to `@ApiResponse` decorators:

```typescript
@ApiResponse({
  status: 200,
  description: 'Success',
  schema: {
    type: 'object',
    properties: {
      field: { type: 'string' }
    }
  }
})
```

Or reference a DTO:

```typescript
@ApiResponse({
  status: 200,
  description: 'Success',
  type: YourResponseDto
})
```

### Issue: Authentication not working in Swagger UI

**Solution:** Make sure `@ApiSecurity('api-key')` is added to controllers and the security scheme is defined in `main.ts`:

```typescript
.addApiKey(
  {
    type: 'apiKey',
    name: 'x-api-key',
    in: 'header',
  },
  'api-key',
)
```

## 📚 Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Swagger Editor](https://editor.swagger.io/) - Online spec editor

## 📝 Checklist

When updating documentation, ensure you:

- [ ] Updated Swagger decorators in controllers
- [ ] Updated `@ApiProperty` decorators in DTOs
- [ ] Regenerated OpenAPI spec
- [ ] Validated OpenAPI spec
- [ ] Updated README with new examples
- [ ] Tested interactive docs
- [ ] Tested code examples
- [ ] Checked all links work
- [ ] Committed changes to Git
- [ ] Deployed updated docs

## 🤝 Contributing

When contributing documentation improvements:

1. Fork the repository
2. Create a feature branch (`git checkout -b docs/improve-examples`)
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Include in your PR:
- What you changed and why
- Screenshots of the updated docs (if applicable)
- Confirmation that you tested the changes
