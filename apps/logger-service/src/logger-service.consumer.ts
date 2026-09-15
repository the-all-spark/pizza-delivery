import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { LoggerServiceService } from './logger-service.service';

@Controller()
export class LoggerServiceConsumer {
  constructor(private readonly loggerService: LoggerServiceService) {}

  // Заглушка под обработку логов из RabbitMQ (Часть 2 - логи в MongoDB)
  @MessagePattern('log_event')
  async handleLogEvent(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('[Logger-Service] Получено новое событие для логирования:', data);
    
    // Здесь в будущем будет вызов сервиса для записи в MongoDB:
    // await this.loggerService.saveLog(data);

    // Подтверждаем получение сообщения в RabbitMQ
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
