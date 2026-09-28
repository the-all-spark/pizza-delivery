// * Глобальный перехватчик успешных HTTP-запросов для логирования событий (INFO)

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    @Inject('LOGGER_SERVICE') private readonly loggerClient: ClientProxy,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    // Приводим тип запроса к AuthenticatedRequest вместо стандартного Request
    const request = httpContext.getRequest<AuthenticatedRequest>();
    const response = httpContext.getResponse<Response>();

    const startTime = Date.now();

    // Передаем запрос дальше по цепочке к контроллерам шлюза
    return next.handle().pipe(
      tap(() => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          const duration = Date.now() - startTime;
          const userStr = request.user ? `User ID: ${request.user.userId}` : 'Anonymous';
          const logMessage = `Успешный запрос: ${request.method} ${request.url} | ${userStr} | Статус: ${response.statusCode} | Время: ${duration}мс`;

          this.loggerClient.emit('log_event', {
            context: 'api-gateway',
            level: 'info',
            message: logMessage,
            trace: null,
          });
        }
      }),
    );
  }
}
