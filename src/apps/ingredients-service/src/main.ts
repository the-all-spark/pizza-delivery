import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { IngredientModule } from './ingredient.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(IngredientModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'ingredients_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('🚀 Микросервис INGREDIENTS_SERVICE успешно запущен и слушает ingredients_queue...');
}
bootstrap();
