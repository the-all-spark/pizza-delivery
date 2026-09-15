import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Запускаем как обычное HTTP приложение для временных тестов
  const app = await NestFactory.create(AppModule);

  // Включаем глобальную валидацию (пригодится для DTO)
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Слушаем порт 3001 (внутри контейнера)
  const port = process.env.PIZZA_SERVICE_PORT || 3001;
  await app.listen(port);
  // console.log(`[Pizza-Service] Временный HTTP-сервер успешно запущен на порту ${port}`);
}

void bootstrap();
