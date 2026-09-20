// * Главный файл запуска микросервиса notification-service

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  // 1. Создаем экземпляр микросервиса с транспортным протоколом RabbitMQ
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationModule, // Подключаем модуль
    {
      transport: Transport.RMQ,
      options: {
        // Читаем URL из переменных окружения (Docker), либо используем дефолтный локальный путь
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],

        // Указываем имя очереди
        // совпадает с именем, зарегистрированным на шлюзе и в модулях авторизации/пользователей
        queue: 'notification_queue',

        // NestJS сам сделает ack, когда метод отработает
        noAck: true,

        // Опция durable гарантирует, что очередь и письма в ней не пропадут при перезапуске RabbitMQ
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  // 2. Запускаем прослушивание очереди RabbitMQ
  await app.listen();
  console.log(
    '🚀 Микросервис NOTIFICATION_SERVICE успешно запущен и слушает notification_queue...',
  );
}

bootstrap();
