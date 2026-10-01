// *  Главная точка входа сервиса

/**
 * Поднимает шлюз на порту 3000, включает глобальные Pipes для DTO-валидации
 * и настраивает SWAGGER документацию и Express для раздачи изображений пицц из общей папки.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { ApiGatewayModule } from './api-gateway.module';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { ClientProxy } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  app.setGlobalPrefix('api');

  // Серверная валидация DTO для входящих запросов шлюза
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Глобальный перехватчик событий INFO
  const loggerClient = app.get<ClientProxy>('LOGGER_SERVICE');
  app.useGlobalInterceptors(new LoggerInterceptor(loggerClient));

  // Раздача картинок из папки uploads
  const uploadsPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  console.log(`[API Gateway] Папка статических файлов подключена по пути: ${uploadsPath}`);

  // SWAGGER документация
  const config = new DocumentBuilder()
    .setTitle('Pizza Delivery API')
    .setDescription('A single entry point for a pizza delivery microservice application')
    .setVersion('1.0')

    .addServer('http://localhost:3000/api', 'v1.0 (Local Development)')

    .addTag('Health')
    .addTag('Auth')
    .addTag('Users')

    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token in the field below without the word "Bearer".',
        in: 'header',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  console.log(
    '[API Gateway] Документация Swagger успешно развернута по адресу: http://localhost:3000/docs',
  );

  // Запуск HTTP-сервера на порту 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[API Gateway] HTTP-шлюз успешно запущен на публичном порту ${port}`);
}

void bootstrap();
