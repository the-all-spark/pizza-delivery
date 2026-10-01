// * Приемщик сообщений (Consumer) из очередей RabbitMQ

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoggerService } from '../src/logger.service';
import { ILog } from './schemas/log.interface';

@Controller()
export class LoggerConsumer {
  constructor(private readonly loggerService: LoggerService) {}

  @MessagePattern('log_event')
  async handleLogEvent(@Payload() data: Omit<ILog, 'timestamp'>) {
    await this.loggerService.createLog(data);
    return { success: true };
  }
}
