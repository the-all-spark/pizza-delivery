import { NestFactory } from '@nestjs/core';
import { LoggerServiceModule } from './logger-service.module'; // ИМЕННО ЭТОТ КЛАСС

async function bootstrap() {
  const app = await NestFactory.create(LoggerServiceModule);
  // ... логика запуска микросервиса RabbitMQ
  await app.listen(3001); // или запуск как микросервис через connectMicroservice
}
void bootstrap();