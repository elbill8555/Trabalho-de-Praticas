import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api/v1');

    app.enableCors({
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
      ],
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    const { ValidationPipe } = await import('@nestjs/common');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
  }

  return app.getHttpAdapter().getInstance();
}

export default async (req, res) => {
  const instance = await bootstrap();
  return instance(req, res);
};
