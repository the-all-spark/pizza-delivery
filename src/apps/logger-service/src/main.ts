// * Точка входа для запуска logger-service

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LoggerModule } from './logger.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(LoggerModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'logger_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('🚀 Микросервис LOGGER-SERVICE успешно запущен и слушает RabbitMQ...');
}

bootstrap();
