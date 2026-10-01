// * Главный файл запуска микросервиса notification-service

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'notification_queue',
      noAck: true,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log(
    '🚀 Микросервис NOTIFICATION_SERVICE успешно запущен и слушает notification_queue...',
  );
}

bootstrap();
