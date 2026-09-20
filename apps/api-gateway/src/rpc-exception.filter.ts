/* Когда внутренний микросервис падает или выбрасывает ошибку 
(например, ConflictException при регистрации), RabbitMQ передает её в виде системного объекта. 
Без фильтра шлюз вернет клиенту общую ошибку 500 Internal Server Error.
Мы создадим перехватчик, который трансформирует сообщения от внутренних сервисов в понятные HTTP-статусы.
*/

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
  // Конструктор для внедрения службы уведомлений через прокси-клиент RabbitMQ
  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Если это стандартное HTTP исключение самого шлюза (например, глобальная гварда), отдаем как есть
    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    // Логируем сырой объект ошибки в консоль шлюза для удобства локального дебага
    console.error(
      '[Gateway Error Filter] Перехвачена ошибка микросервиса:',
      exception,
    );

    // По умолчанию выставляем 500.
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception && typeof exception === 'object') {
      // Извлекаем потенциальные статус-коды
      const rawStatus = exception.statusCode || exception.status;

      // Проверяем, что извлеченный статус является именно ЧИСЛОМ.
      // Если микросервис вернул строку "error", Number.isInteger отсечет её, предотвратив падение Express.
      if (Number.isInteger(rawStatus)) {
        status = rawStatus;
      }
    }

    // Безопасно извлекаем сообщение об ошибке
    const message = exception?.message || 'Внутренняя ошибка микросервиса';

    // Если зафиксирована критическая ошибка системы (статус 500 и выше)
    if (status >= 500) {
      console.log(
        '🚨 [RpcExceptionFilter] Зафиксирован критический сбой 500! Отправляем событие администратору...',
      );

      // Собираем детали ошибки. Если стэк-трейс отсутствует (из-за сериализации RabbitMQ),
      // преобразуем текстовое или объектное сообщение в строковый вид.
      const errorDetails =
        exception?.stack ||
        (typeof message === 'object' ? JSON.stringify(message) : message);

      // Отправляем асинхронное событие в notification_queue для notification-service
      this.notificationClient.emit('critical_error_event', {
        service: 'api-gateway_rpc_filter', // Указываем, что ошибку поймал RPC-фильтр шлюза
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
