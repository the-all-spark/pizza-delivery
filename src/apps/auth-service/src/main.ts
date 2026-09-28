// * Главный файл запуска микросервиса auth-service

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Создаем экземпляр микросервиса с транспортным протоколом RabbitMQ
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      // Указываем URL для подключения к брокеру сообщений RabbitMQ.
      // Если в процессе сборки переменная окружения не найдена, используем дефолтный локальный путь.
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],

      // Имя очереди должно строго совпадать с именем очереди,
      // в которую API Gateway отправляет команды для auth-service!
      queue: 'auth_queue',

      // Опция durable гарантирует, что очередь не пропадет при перезапуске RabbitMQ
      queueOptions: {
        durable: true,
      },
    },
  });

  // 2. Запускаем прослушивание очереди RabbitMQ
  await app.listen();
  console.log('🚀 Микросервис AUTH_SERVICE успешно запущен и слушает auth_queue...');
}

bootstrap();
