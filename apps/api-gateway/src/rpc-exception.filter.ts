/* Когда внутренний микросервис падает или выбрасывает ошибку 
(например, ConflictException при регистрации), RabbitMQ передает её в виде системного объекта. 
Без фильтра шлюз вернет клиенту общую ошибку 500 Internal Server Error.
Мы создадим перехватчик, который трансформирует сообщения от внутренних сервисов 
в понятные HTTP-статусы.
*/

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Если это стандартное HTTP исключение самого шлюза (например, гварда), отдаем как есть
    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    // Если это ошибка, прилетевшая из микросервиса по RabbitMQ
    console.error(
      '[Gateway Error Filter] Перехвачена ошибка микросервиса:',
      exception,
    );

    // Микросервисы NestJS обычно возвращают объект с полями status/statusCode и message
    const status =
      exception.status || exception.statusCode || HttpStatus.BAD_REQUEST;
    const message = exception.message || 'Внутренняя ошибка микросервиса';

    return response.status(status).json({
      statusCode: status,
      message: message,
      error: exception.error || 'Bad Request',
    });
  }
}
