// * Приемщик сообщений (Consumer) микросервиса notification-service

import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationConsumer {
  constructor(private readonly notificationService: NotificationService) {}

  // * Слушаем событие успешной регистрации пользователя
  @EventPattern('user_registered_event')
  async handleUserRegistered(
    @Payload() data: { email: string; firstName: string; lastName: string },
  ) {
    console.log(`📩 Получено событие регистрации пользователя: ${data.email}`);

    // Передаем email и имя в сервис для отправки приветственного письма
    await this.notificationService.sendWelcomeEmail(data.email, data.firstName);
  }

  // * Слушаем событие удаления аккаунта пользователя
  @EventPattern('user_deleted_event')
  async handleUserDeleted(@Payload() data: { email: string; firstName: string; lastName: string }) {
    console.log(`📩 Получено событие удаления пользователя: ${data.email}`);

    await this.notificationService.sendGoodbyeEmail(data.email, data.firstName);
  }

  // * Слушаем событие критической ошибки из любого микросервиса системы
  @EventPattern('critical_error_event')
  async handleCriticalError(@Payload() data: { service: string; message: string }) {
    console.log(`⚠️ Получено уведомление о критической ошибке из сервиса: ${data.service}`);

    await this.notificationService.sendCriticalErrorEmail(data.service, data.message);
  }
}
