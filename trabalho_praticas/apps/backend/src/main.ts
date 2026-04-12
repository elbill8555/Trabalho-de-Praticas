import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

console.log('[FUNC LOAD] Backend function module loaded. NODE_ENV=', process.env.NODE_ENV);

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
  const method = req.method ? req.method.toUpperCase().trim() : 'UNKNOWN';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Set CORS headers for ALL requests
  try {
    res.setHeader('Access-Control-Allow-Origin', frontendUrl);
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  } catch (headerError) {
    console.error('[CORS HEADER ERROR]', headerError);
  }

  console.log('[FUNC HANDLER] request received', `method="${method}"`, `url="${req.url}"`, `origin="${frontendUrl}"`);
  
  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    console.log('[OPTIONS HANDLER] responding to CORS preflight');
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const instance = await bootstrap();
    console.log('[FUNC HANDLER] instance ready, forwarding request');
    return instance(req, res);
  } catch (error) {
    console.error('[FUNC CRASH] error in handler:', error);
    res.statusCode = 500;
    res.json?.({ error: 'Internal Server Error' }) || res.end('Internal Server Error');
  }
};
