import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { CartModule } from './cart.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CartModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'cart_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('🚀 Микросервис CART_SERVICE успешно запущен и слушает cart_queue...');
}
bootstrap();
