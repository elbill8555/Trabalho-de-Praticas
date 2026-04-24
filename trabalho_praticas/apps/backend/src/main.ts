import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';

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
      app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger(winstonConfig),
      });
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
  const method = (req.method || 'GET').toUpperCase();
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').trim();
  
  console.log('[FUNC HANDLER] method=', method, 'url=', req.url, 'frontend=', frontendUrl);

  // Add CORS headers to ALL responses
  const originalEnd = res.end;
  res.end = function(...args) {
    if (!res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('Access-Control-Allow-Origin', frontendUrl);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.setHeader('Access-Control-Credentials', 'true');
    }
    return originalEnd.apply(res, args);
  };

  // Handle OPTIONS preflight
  if (method === 'OPTIONS') {
    console.log('[OPTIONS HANDLER] responding to preflight');
    res.statusCode = 204;
    return res.end();
  }

  try {
    const instance = await bootstrap();
    console.log('[FUNC HANDLER] forwarding to NestJS');
    
    // Wrap response to catch errors AND ensure we log status codes
    const originalEnd = res.end;
    const originalJson = res.json;
    
    res.end = function(...args) {
      console.error('[RESPONSE END] status:', res.statusCode, 'headers sent:', res.headersSent);
      return originalEnd.apply(res, args);
    };
    
    res.json = function(data) {
      console.log('[RESPONSE JSON] status:', res.statusCode, 'data:', data);
      return originalJson.call(this, data);
    };
    
    return instance(req, res);
  } catch (error) {
    console.error('[BOOTSTRAP ERROR]', error);
    console.error('[BOOTSTRAP ERROR STACK]', (error as any)?.stack);
    
    // Only try to set status if headers haven't been sent
    if (!res.headersSent) {
      res.statusCode = 500;
    }
    return res.end(JSON.stringify({ 
      error: 'Internal Server Error',
      message: (error as any)?.message || String(error),
      timestamp: new Date().toISOString(),
    }));
  }
};
