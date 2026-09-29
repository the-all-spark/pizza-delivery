import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // планировщик для Cron задач
import { createDatabase } from 'typeorm-extension';
import { DataSourceOptions } from 'typeorm';

import { PizzaController } from './pizza.controller';
import { PizzaService } from './pizza.service';
import { Pizza } from './pizza.entity';

import { Ingredient } from '../../ingredients-service/src/ingredient.entity';
import { SeedModule } from '../../../core/seeds/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Настройка подключения к СУБД PostgreSQL
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
          entities: [Ingredient, Pizza],
          synchronize: true,
          logging: ['error', 'schema', 'warn'],
        };

        // Проверка существования БД перед стартом
        await createDatabase({
          options,
          initialDatabase: 'postgres',
          ifNotExist: true,
        });

        return options;
      },
    }),

    // Регистрируем локальные сущности для репозиториев текущего модуля
    TypeOrmModule.forFeature([Ingredient, Pizza]),

    // Инициализируем планировщик задач
    ScheduleModule.forRoot(),

    // Подключаем сопутствующие модули
    SeedModule,
  ],
  controllers: [PizzaController],
  providers: [PizzaService],
  exports: [PizzaService, TypeOrmModule],
})
export class PizzasModule {}
