// * Настройка модуля (Подключение RabbitMQ)

/**
 * Здесь мы настраиваем прокси-клиентов для очередей RabbitMQ.
 * Шлюз будет использовать две разные очереди:
 * auth_queue (для работы с пользователями) и pizza_queue (для меню, корзины и заказов).
 * Также здесь регистрируется JwtModule.
 */

//!
// import { Module } from '@nestjs/common';
// import { ApiGatewayController } from './api-gateway.controller';
// import { ApiGatewayService } from './api-gateway.service';

// @Module({
//   imports: [],
//   controllers: [ApiGatewayController],
//   providers: [ApiGatewayService],
// })
// export class ApiGatewayModule {}

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { GatewayJwtGuard } from './guards/gateway-jwt.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Настраиваем JWT модуль для проверки подписей токенов на шлюзе
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     secret: configService.get<string>('JWT_SECRET', 'super-secret-key'),
    //   }),
    // }),

    // Настраиваем JWT модуль жестко на один ключ для тестов
    JwtModule.register({
      secret: 'super-secret-key', // ТЕПЕРЬ ОН СТРОГО ИСПОЛЬЗУЕТ ЭТУ СТРОКУ
    }),

    // Регистрируем RabbitMQ клиенты для отправки команд в микросервисы
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>(
                'RABBITMQ_URL',
                'amqp://localhost:5672',
              ),
            ],
            queue: 'auth_queue', // Очередь для auth-service
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'PIZZA_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>(
                'RABBITMQ_URL',
                'amqp://localhost:5672',
              ),
            ],
            queue: 'pizza_queue', // Очередь для pizza-service
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [ApiGatewayController],
  providers: [
    ApiGatewayService,
    // Делаем наш созданный GatewayJwtGuard ГЛОБАЛЬНЫМ для всего шлюза
    {
      provide: APP_GUARD,
      useClass: GatewayJwtGuard,
    },
  ],
})
export class ApiGatewayModule {}
