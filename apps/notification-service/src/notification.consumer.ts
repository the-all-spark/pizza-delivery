import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationConsumer {
  constructor(private readonly notificationService: NotificationService) {}

  // Заглушка под рассылку Email при регистрации/удалении (Доп. требования ТЗ)
  @MessagePattern('send_email')
  async handleSendEmail(
    @Payload()
    data: { email: string; subject: string; template: string; context: any },
    @Ctx() context: RmqContext,
  ) {
    console.log(
      `[Notification-Service] Получена задача на отправку Email для: ${data.email}`,
    );

    // Здесь в будущем будет вызов MailerService:
    // await this.notificationService.sendMail(data);

    // Подтверждаем получение сообщения в RabbitMQ
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
