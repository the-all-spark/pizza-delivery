import { NestFactory } from '@nestjs/core';
import { PizzaServiceModule } from './pizza-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PizzaServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
