import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StartupHealthService } from './services/startup-health.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const startupHealthService = app.get(StartupHealthService);

  // Check external services health before starting
  console.log('🏥 Running startup health checks...');
  const servicesHealthy = await startupHealthService.waitForServices(3, 5000);
  
  if (!servicesHealthy) {
    console.error('❌ External services health check failed. Exiting...');
    process.exit(1);
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || [
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Swagger / OpenAPI
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED');
  if (!swaggerEnabled || swaggerEnabled.toLowerCase() !== 'false') {
    const swaggerConfig: ReturnType<DocumentBuilder['build']> =
      new DocumentBuilder()
        .setTitle('Hackathon Core Service')
        .setDescription(
          'APIs for managing hackathons, teams, submissions, and analytics',
        )
        .setVersion('1.0.0')
        .addApiKey(
          { type: 'apiKey', name: 'x-api-key', in: 'header' },
          'ApiKey',
        )
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Admin/User JWT from Auth service',
          },
          'Bearer',
        )
        .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);
  }

  const port = configService.get<number>('PORT') || 3002;
  await app.listen(port);
  
  console.log(`🚀 Hackathon Core Service running on port ${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/docs`);
}
bootstrap().catch((error) => {
  console.error('💥 Failed to start application:', error);
  process.exit(1);
});
