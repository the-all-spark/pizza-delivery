// * Настройка модуля (настройка прокси-клиентов для очередей RabbitMQ, регистрация JwtModule

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { GatewayJwtGuard } from './guards/gateway-jwt.guard';

import { AuthGatewayController } from './controllers/auth-gateway.controller';
import { UsersGatewayController } from './controllers/users-gateway.controller';
import { IngredientsGatewayController } from './controllers/ingredients-gateway.controller';
import { PizzasGatewayController } from './controllers/pizzas-gateway.controller';
import { CartGatewayController } from './controllers/cart-gateway.controller';
import { PromoCodesGatewayController } from './controllers/promo-codes-gateway.controller';
import { OrdersGatewayController } from './controllers/orders-gateway.controller';

import { HealthModule } from '@core/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    HealthModule,

    // Настройка JWT модуля для проверки подписей токенов на шлюзе
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'super-secret-key'),
      }),
    }),

    // Регистрация RabbitMQ-клиентов для отправки команд в микросервисы
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'auth_queue',
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
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'pizza_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'PROMO_CODE_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'promo_code_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'INGREDIENTS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'ingredients_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'CART_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'cart_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'ORDER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'order_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'notification_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'LOGGER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'logger_queue',
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
    {
      provide: APP_GUARD,
      useClass: GatewayJwtGuard,
    },
  ],
})
export class ApiGatewayModule {}
