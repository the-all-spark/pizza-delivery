import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { LoggerService } from './logger.service';

@Controller()
export class LoggerConsumer {
  constructor(private readonly loggerService: LoggerService) {}

  // Заглушка под обработку логов из RabbitMQ (ТЗ: логи в MongoDB)
  @MessagePattern('log_event')
  async handleLogEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log(
      '[Logger-Service] Получено новое событие для логирования:',
      data,
    );

    // Здесь в будущем будет вызов сервиса для записи в MongoDB:
    // await this.loggerService.saveLog(data);

    // Подтверждаем получение сообщения в RabbitMQ
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
