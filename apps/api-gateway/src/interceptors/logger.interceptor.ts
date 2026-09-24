// * Глобальный перехватчик успешных HTTP-запросов для логирования событий (INFO)

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';
// Импортируем собственный расширенный интерфейс запроса
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    // Внедряем прокси-клиент RabbitMQ для отправки данных в логгер
    @Inject('LOGGER_SERVICE') private readonly loggerClient: ClientProxy,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    // Приводим тип запроса к AuthenticatedRequest вместо стандартного Request
    const request = httpContext.getRequest<AuthenticatedRequest>();
    const response = httpContext.getResponse<Response>();

    // Фиксируем время старта запроса для замера скорости работы микросервисов
    const startTime = Date.now();

    // Передаем запрос дальше по цепочке к контроллерам шлюза
    return next.handle().pipe(
      tap(() => {
        // Логируем событие ТОЛЬКО если запрос завершился успешно (коды 2xx)
        // Ошибки (4xx, 5xx) полностью обрабатываются RpcExceptionFilter
        if (response.statusCode >= 200 && response.statusCode < 300) {
          const duration = Date.now() - startTime;

          // Безопасно извлекаем ID пользователя из JWT-гварды, если он авторизован
          const userStr = request.user
            ? `User ID: ${request.user.userId}`
            : 'Anonymous';

          // Формируем понятное сообщение лога
          const logMessage = `Успешный запрос: ${request.method} ${request.url} | ${userStr} | Статус: ${response.statusCode} | Время: ${duration}мс`;

          // Асинхронно отправляем событие в logger_queue без блокировки ответа клиенту
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
