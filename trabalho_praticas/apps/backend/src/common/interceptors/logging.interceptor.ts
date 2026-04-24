import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CORRELATION_ID_HEADER } from '../middlewares/correlation-id.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const method = req.method;
    const url = req.url;
    const correlationId = req.headers[CORRELATION_ID_HEADER];
    const userAgent = req.headers['user-agent'] || '';
    const now = Date.now();

    this.logger.log(
      `Incoming Request - Method: ${method} URL: ${url} CorrelationId: ${correlationId} UserAgent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap(() => {
        const statusCode = res.statusCode;
        const delay = Date.now() - now;
        this.logger.log(
          `Outgoing Response - Method: ${method} URL: ${url} StatusCode: ${statusCode} Delay: ${delay}ms CorrelationId: ${correlationId}`,
        );
      }),
    );
  }
}
