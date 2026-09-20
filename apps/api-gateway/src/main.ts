// *  Настройка файла main.ts и раздачи статических файлов

// Файл main.ts поднимает шлюз на порту 3000,
// включает глобальные Pipes для DTO-валидации
// и настраивает Express для раздачи изображений пицц из общей папки.

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Импортируем инструменты Swagger
import * as express from 'express';
import { join } from 'path';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // 1. Включаем серверную валидацию DTO для входящих запросов шлюза
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Убирает из JSON поля, не описанные в DTO классах
      transform: true, // Приводит строки к числам/булевым типам там, где это нужно
    }),
  );

  // 2. Настраиваем раздачу картинок из папки uploads сервиса pizza-service
  // В Docker-compose папка примонтирована по пути приложения, делаем её доступной через http://localhost:3000/uploads/...
  const uploadsPath = join(process.cwd(), 'apps', 'pizza-service', 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log(
    `[API Gateway] Папка статических файлов подключена по пути: ${uploadsPath}`,
  );

  // 3. Настраиваем SWAGGER документацию
  // Создаем конфигурацию
  const config = new DocumentBuilder()
    .setTitle('Pizza Delivery API') // Заголовок страницы в браузере
    .setDescription(
      'A single entry point for a pizza delivery microservice application',
    ) // Описание проекта
    .setVersion('1.0') // Версия API

    // Добавляем поддержку авторизации по JWT-токену (Bearer Auth)
    // Это создаст кнопку "Authorize" в правом верхнем углу интерфейса Swagger
    .addBearerAuth(
      {
        type: 'http', // тип протокола
        scheme: 'bearer', // схема авторизации Bearer
        bearerFormat: 'JWT', // Подсказка, что вводить нужно именно JWT-токен
        name: 'JWT', // внутреннее имя схемы авторизации
        description:
          'Enter your JWT token in the field below without the word "Bearer".',
        in: 'header', // Указываем, что токен автоматически прикрепится к заголовкам запроса
      },
      'bearerAuth', // Уникальное кодовое имя для связи этой авторизации с защищенными роутами
    )
    .build();

  // Генерируем сам документ на основе конфигурации и модуля шлюза
  const document = SwaggerModule.createDocument(app, config);

  // Разворачиваем веб-страницу Swagger по адресу /api (http://localhost:3000/api)
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // ВАЖНО: Swagger запомнит ваш токен и он не сотрется при обновлении страницы!
    },
  });
  console.log(
    '[API Gateway] Документация Swagger успешно развернута по адресу: http://localhost:3000/api',
  );

  // 4. Запускаем HTTP-сервер на порту 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(
    `[API Gateway] HTTP-шлюз успешно запущен на публичном порту ${port}`,
  );
}

void bootstrap();
