// * Приемщик сообщений (Consumer) из очередей RabbitMQ

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoggerService } from '../../../../apps/logger-service/src/logger.service';
import { ILog } from './schemas/log.interface';

@Controller()
export class LoggerConsumer {
  constructor(private readonly loggerService: LoggerService) {}

  /**
   * Слушаем входящие события логирования от всех микросервисов системы
   * Паттерн сообщения: 'log_event'
   */
  @MessagePattern('log_event')
  async handleLogEvent(@Payload() data: Omit<ILog, 'timestamp'>) {
    // Безопасно передаем данные в сервис для записи в MongoDB и вывода в консоль
    await this.loggerService.createLog(data);

    // Возвращаем статус успеха для RabbitMQ (подтверждение обработки)
    return { success: true };
  }
}
