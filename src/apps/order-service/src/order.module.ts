// * Главный корневой модуль микросервиса order-service

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';

import * as Entities from '@shared/entities';

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
          entities: Object.values(Entities),
          synchronize: true,
          logging: ['error', 'schema', 'warn'],
        };
        return options;
      },
    }),

    TypeOrmModule.forFeature([
      Entities.Pizza,
      Entities.CartItem,
      Entities.PromoCode,
      Entities.OrderItem,
      Entities.Order,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrderModule {}
