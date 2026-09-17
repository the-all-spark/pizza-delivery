// * Настройка модуля (Подключение RabbitMQ)

/**
 * Здесь мы настраиваем прокси-клиентов для очередей RabbitMQ.
 * Шлюз будет использовать две разные очереди:
 * auth_queue (для работы с пользователями) и pizza_queue (для меню, корзины и заказов).
 * Также здесь регистрируется JwtModule.
*/

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { GatewayJwtGuard } from './guards/gateway-jwt.guard';

// Импортируем раздельные контроллеры
import { AuthGatewayController } from './controllers/auth-gateway.controller';
import { UsersGatewayController } from './controllers/users-gateway.controller';
import { IngredientsGatewayController } from './controllers/ingredients-gateway.controller'
import { PizzasGatewayController } from './controllers/pizzas-gateway.controller';
import { CartGatewayController } from './controllers/cart-gateway.controller';
import { PromoCodesGatewayController } from './controllers/promo-codes-gateway.controller';
import { OrdersGatewayController } from './controllers/orders-gateway.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Настраиваем JWT модуль для проверки подписей токенов на шлюзе
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Считываем секрет из .env, а 'super-secret-key' оставляем как запасной дефолтный вариант
        secret: configService.get<string>('JWT_SECRET', 'super-secret-key'),
      }),
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
  controllers: [
    AuthGatewayController,
    UsersGatewayController,
    IngredientsGatewayController,
    PizzasGatewayController,
    CartGatewayController,
    PromoCodesGatewayController,
    OrdersGatewayController,
  ],
  providers: [
    // Делаем созданный GatewayJwtGuard ГЛОБАЛЬНЫМ для всего шлюза
    {
      provide: APP_GUARD,
      useClass: GatewayJwtGuard,
    },
  ],
})
export class ApiGatewayModule {}
