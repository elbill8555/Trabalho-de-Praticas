import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { ValidationPipe, INestApplication } from '@nestjs/common';

let appPromise: Promise<INestApplication> | null = null;

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

function getAllowedOrigins(): string[] {
  const rawFrontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  const fromEnv = rawFrontend
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...fromEnv, 'http://localhost:3000']));
}

async function getApp(): Promise<INestApplication> {
  if (!appPromise) {
    appPromise = (async () => {
      const app = await NestFactory.create(AppModule, {
        logger: WinstonModule.createLogger(winstonConfig),
      });

      app.setGlobalPrefix('api/v1');
      app.enableCors({
        origin: getAllowedOrigins(),
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
      });
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

      await app.init();
      return app;
    })();
  }

  return appPromise;
}

export default async (req, res) => {
  const method = (req.method || 'GET').toUpperCase();
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = typeof req.headers?.origin === 'string' ? req.headers.origin : '';
  const responseOrigin = allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0];

  const originalEnd = res.end;
  res.end = function(...args) {
    if (!res.getHeader('Access-Control-Allow-Origin')) {
      res.setHeader('Access-Control-Allow-Origin', responseOrigin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      res.setHeader('Access-Control-Credentials', 'true');
    }
    return originalEnd.apply(res, args);
  };

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const app = await getApp();
    const instance = app.getHttpAdapter().getInstance();
    return instance(req, res);
  } catch (error) {
    console.error('[BOOTSTRAP ERROR]', error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
    }
    return res.end(JSON.stringify({ 
      error: 'Internal Server Error',
      message: (error as any)?.message || String(error),
      timestamp: new Date().toISOString(),
    }));
  }
};

async function bootstrapLocal() {
  try {
    const app = await getApp();
    const port = Number(process.env.BACKEND_PORT || process.env.PORT || 3001);
    await app.listen(port);
    console.log(`[BOOT] Backend iniciado em http://localhost:${port}`);
  } catch (error) {
    console.error('[BOOT CRASH] Erro fatal durante a inicializacao:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  bootstrapLocal();
}
