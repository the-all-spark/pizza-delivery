import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { PromoCodeModule } from './promo-code.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(PromoCodeModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'promo_code_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
  console.log('🚀 Микросервис PROMO_CODE_SERVICE успешно запущен и слушает promo_code_queue...');
}
bootstrap();
