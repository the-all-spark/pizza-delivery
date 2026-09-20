// * Приемщик сообщений (Consumer) микросервиса notification-service
// слушает RabbitMQ, извлекает данные из событий и передает их в методы NotificationService для отправки писем
// используем декоратор @EventPattern(), т.е. не нужно возвращать никакого ответа обратно шлюзу
// @Payload() автоматически достает объект с данными ({ email, firstName... }), который упаковал и отправил другой микросервис

import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationConsumer {
  constructor(private readonly notificationService: NotificationService) {}

  // * 1. Слушаем событие успешной регистрации пользователя
  // Паттерн 'user_registered_event' отправляется из auth.service.ts
  @EventPattern('user_registered_event')
  async handleUserRegistered(
    @Payload() data: { email: string; firstName: string; lastName: string },
  ) {
    console.log(`📩 Получено событие регистрации пользователя: ${data.email}`);

    // Передаем email и имя в сервис для отправки приветственного письма
    await this.notificationService.sendWelcomeEmail(data.email, data.firstName);
  }

  // * 2. Слушаем событие удаления аккаунта пользователя
  // Паттерн 'user_deleted_event' отправляется из users.service.ts
  @EventPattern('user_deleted_event')
  async handleUserDeleted(
    @Payload() data: { email: string; firstName: string; lastName: string },
  ) {
    console.log(`📩 Получено событие удаления пользователя: ${data.email}`);

    // Передаем email и имя в сервис для отправки прощального письма
    await this.notificationService.sendGoodbyeEmail(data.email, data.firstName);
  }

  // * 3. Слушаем событие критической ошибки из любого микросервиса системы
  // Паттерн 'critical_error_event' может быть отправлен любым сервисом
  @EventPattern('critical_error_event')
  async handleCriticalError(
    @Payload() data: { service: string; message: string },
  ) {
    console.log(
      `⚠️ Получено уведомление о критической ошибке из сервиса: ${data.service}`,
    );

    // Отправляем отчет на email администратора
    await this.notificationService.sendCriticalErrorEmail(
      data.service,
      data.message,
    );
  }
}
