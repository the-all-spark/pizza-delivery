// * Модуль микросервиса отправки уведомлений
// слушает входящие сообщения (берет задачу из RabbitMQ) и шлет письма наружу

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [
    // Импортируем ConfigModule, чтобы NotificationService имел доступ к переменным окружения из .env
    ConfigModule.forRoot({
      isGlobal: true, // Делает модуль конфигурации глобальным для всех подкомпонентов сервиса
    }),
  ],
  controllers: [
    NotificationConsumer, // Регистрируем приемщик сообщений RabbitMQ в качестве контроллера
  ],
  providers: [
    NotificationService, // Регистрируем сервис с бизнес-логикой и SMTP-транспортом
  ],
  exports: [
    NotificationService, // Экспортируем сервис на случай будущего расширения приложения
  ],
})
export class NotificationModule {}
