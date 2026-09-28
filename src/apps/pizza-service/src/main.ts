import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PizzasModule } from './pizzas.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(PizzasModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'pizza_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('🚀 Микросервис PIZZA_SERVICE успешно запущен и слушает pizza_queue...');
}
bootstrap();
