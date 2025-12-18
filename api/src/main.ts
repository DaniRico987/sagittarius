import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  // Validate critical environment variables
  if (!process.env.MONGO_URI) {
    throw new Error('❌ MONGO_URI is not defined in environment variables');
  }
  if (!process.env.JWT_SECRET) {
    console.warn(
      '⚠️ JWT_SECRET not defined, using default (INSECURE for production)',
    );
  }

  const app = await NestFactory.create(AppModule);

  // Apply global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Habilitar CORS para permitir solicitudes desde el frontend Angular (http://localhost:4200)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
