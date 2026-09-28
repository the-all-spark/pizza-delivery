// * Фильтр исключений для шлюза (трансформация сообщений от внутренних сервисов в HTTP-статусы)

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  // Конструктор для внедрения служб уведомлений и централизованного логирования через прокси-клиент RabbitMQ
  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,

    @Inject('LOGGER_SERVICE')
    private readonly loggerClient: ClientProxy,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Если это стандартное HTTP исключение самого шлюза, логируем его перед отправкой ответа клиенту
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resObj = exception.getResponse();

      const errMsg =
        typeof resObj === 'object' && resObj !== null && 'message' in resObj
          ? (resObj as any).message
          : exception.message;

      this.loggerClient.emit('log_event', {
        context: 'api-gateway_http',
        level: status >= 500 ? 'error' : 'warn',
        message: `HTTP сбой: ${typeof errMsg === 'object' ? JSON.stringify(errMsg) : String(errMsg)}`,
        trace: exception.stack || null,
      });

      return response.status(status).json(resObj);
    }
    console.error('[Gateway Error Filter] Перехвачена ошибка микросервиса:', exception);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception && typeof exception === 'object') {
      const rawStatus = exception.statusCode || exception.status;

      if (Number.isInteger(rawStatus)) {
        status = rawStatus;
      }
    }

    const message = exception?.message || 'Внутренняя ошибка микросервиса';

    // Асинхронно отправляем лог сбоя в logger-service
    this.loggerClient.emit('log_event', {
      context: 'api-gateway',
      level: status >= 500 ? 'error' : 'warn',
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      trace: exception?.stack || null,
    });

    if (status >= 500) {
      console.log(
        '🚨 [RpcExceptionFilter] Зафиксирован критический сбой 500! Отправляем событие администратору...',
      );

      const errorDetails =
        exception?.stack || (typeof message === 'object' ? JSON.stringify(message) : message);

      // Отправляем асинхронное событие в notification_queue для notification-service
      this.notificationClient.emit('critical_error_event', {
        service: 'api-gateway_rpc_filter',
        message: `Microservice crashed with error: ${errorDetails}`,
      });
    }

    // Возвращаем структурированный JSON-ответ клиенту в Swagger/фронтенд, чтобы запрос не зависал
    return response.status(status).json({
      statusCode: status,
      message: message,
      error: status === 500 ? 'Internal Server Error' : 'Bad Request',
    });
  }
}
