// * Главный корневой модуль микросервиса pizza-service

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; // Импорт планировщика для Cron задач
import { createDatabase } from 'typeorm-extension';
import { DataSourceOptions } from 'typeorm';

// Импорт компонентов текущего модуля пицц
import { PizzaController } from './pizza.controller';
import { PizzaService } from './pizza.service';
import { Pizza } from './pizza.entity';

// Импорт сущностей для генерации связанных таблиц
import { User } from '../../auth-service/src/modules/users/user.entity';

// Импорт модуля автозаполнения (Seed)
import { SeedModule } from '../../../core/seeds/seed.module';

@Module({
  imports: [
    // 1. Конфигурация окружения (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Настройка подключения к СУБД PostgreSQL
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
          entities: [User, Pizza],
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

    // 3. Регистрируем локальную сущность Pizza для репозиториев текущего модуля
    TypeOrmModule.forFeature([Pizza]),

    // 4. Инициализируем планировщик задач для автоматической очистки пицц по Cron
    ScheduleModule.forRoot(),

    // 5. Подключаем сопутствующие модули
    SeedModule,
  ],
  controllers: [PizzaController],
  providers: [PizzaService],
  exports: [PizzaService, TypeOrmModule],
})
export class PizzasModule {}
