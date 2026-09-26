// * Точка входа для запуска logger-service

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LoggerModule } from './logger.module';

async function bootstrap() {
  // Создаем изолированное микросервисное приложение на базе LoggerModule
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(LoggerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      // Имя очереди, которую будет слушать сервис логов
      queue: 'logger_queue',
      // Логика автоматического подтверждения доставки сообщений
      queueOptions: {
        durable: true,
      },
    },
  });

  // Запускаем прослушивание очереди RabbitMQ
  await app.listen();
  console.log('🚀 Микросервис LOGGER-SERVICE успешно запущен и слушает RabbitMQ...');
}

bootstrap();
