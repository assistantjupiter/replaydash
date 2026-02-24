import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('ReplayDash API')
    .setDescription('Session replay and user analytics API for capturing and analyzing user interactions')
    .setVersion('1.0')
    .addTag('events', 'Event ingestion endpoints')
    .addTag('sessions', 'Session management endpoints')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API key for authentication',
      },
      'api-key',
    )
    .addServer('http://localhost:3001', 'Local development')
    .addServer('https://api.replaydash.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ReplayDash API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Export OpenAPI spec as JSON and YAML
  const docsDir = path.join(__dirname, '../../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write JSON spec
  fs.writeFileSync(
    path.join(docsDir, 'openapi.json'),
    JSON.stringify(document, null, 2),
  );

  console.log(`📝 OpenAPI spec exported to ${docsDir}/openapi.json`);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 ReplayDash API running on http://localhost:${port}`);
  console.log(`📚 API Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
