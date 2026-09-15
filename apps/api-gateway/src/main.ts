// *  Настройка файла main.ts и раздачи статических файлов

// Файл main.ts поднимает шлюз на порту 3000,
// включает глобальные Pipes для DTO-валидации и
// настраивает Express для раздачи изображений пицц из общей папки.

// !
// import { NestFactory } from '@nestjs/core';
// import { ApiGatewayModule } from './api-gateway.module';

// async function bootstrap() {
//   const app = await NestFactory.create(ApiGatewayModule);
//   await app.listen(process.env.port ?? 3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // 1. Включаем серверную валидацию DTO для входящих запросов шлюза (Часть 2 ТЗ)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Убирает из JSON поля, не описанные в DTO классах
      transform: true, // Приводит строки к числам/булевым типам там, где это нужно
    }),
  );

  // 2. Настраиваем раздачу картинок из папки uploads сервиса pizza-service (Часть 2 ТЗ)
  // В Docker-compose папка примонтирована по пути приложения, делаем её доступной через http://localhost:3000/uploads/...
  const uploadsPath = join(process.cwd(), 'apps', 'pizza-service', 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log(
    `[API Gateway] Папка статических файлов подключена по пути: ${uploadsPath}`,
  );

  // 3. Запускаем HTTP-сервер на порту 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(
    `[API Gateway] HTTP-шлюз успешно запущен на публичном порту ${port}`,
  );
}

void bootstrap();
