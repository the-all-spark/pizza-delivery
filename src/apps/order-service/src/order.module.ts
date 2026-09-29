// * Главный корневой модуль микросервиса order-service

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';

import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartItem } from '../../cart-service/src/cart-item.entity';
import { PromoCode } from '../../promo-code-service/src/promo-code.entity';
import { Pizza } from '../../pizza-service/src/pizza.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const options: DataSourceOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: Number(configService.get('DB_PORT', 5432)),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME', 'pizza_delivery'),
          entities: [Pizza, CartItem, PromoCode, OrderItem, Order],
          synchronize: true,
          logging: ['error', 'schema', 'warn'],
        };
        return options;
      },
    }),

    TypeOrmModule.forFeature([Pizza, CartItem, PromoCode, OrderItem, Order]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrderModule {}