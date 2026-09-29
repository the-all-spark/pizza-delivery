// * Главный корневой модуль микросервиса cart-service

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './cart-item.entity';
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
          entities: [CartItem, Pizza],
          synchronize: true,
          logging: ['error', 'schema', 'warn'],
        };
        return options;
      },
    }),

    TypeOrmModule.forFeature([CartItem, Pizza]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
