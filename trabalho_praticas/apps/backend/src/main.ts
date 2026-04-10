import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let app;

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

async function bootstrap() {
  if (!app) {
    try {
      console.log('[BOOT 0] NODE_ENV=', process.env.NODE_ENV);
      console.log('[BOOT 0] CLERK_SECRET_KEY defined=', !!process.env.CLERK_SECRET_KEY);
      console.log('[BOOT 0] JWT_SECRET defined=', !!process.env.JWT_SECRET);
      console.log('[BOOT 0] DATABASE_URL defined=', !!process.env.DATABASE_URL);

      console.log('[BOOT 1] Iniciando criação do NestFactory...');
      app = await NestFactory.create(AppModule);
      console.log('[BOOT 2] NestFactory criado com sucesso.');

      app.setGlobalPrefix('api/v1');

      app.enableCors({
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:3000',
          'http://localhost:3000',
        ],
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
      });

      console.log('[BOOT 3] Pipes globais e CORS configurados.');
      const { ValidationPipe } = await import('@nestjs/common');
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

      console.log('[BOOT 4] Chamando app.init()...');
      await app.init();
      console.log('[BOOT 5] app.init() concluído.');
    } catch (error) {
      console.error('[BOOT CRASH] Erro fatal durante a inicialização:', error);
      throw error;
    }
  }

  return app.getHttpAdapter().getInstance();
}

export default async (req, res) => {
  const instance = await bootstrap();
  return instance(req, res);
};
