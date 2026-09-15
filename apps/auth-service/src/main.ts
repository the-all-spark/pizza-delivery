import { NestFactory } from '@nestjs/core';
// Важно: поднимаем AppModule, а не AuthModule.
// TypeORM (и создание таблицы users) живёт только в AppModule.
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
