import { NestFactory } from '@nestjs/core';
import { LoggerServiceModule } from './logger-service.module';

async function bootstrap() {
  const app = await NestFactory.create(LoggerServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
