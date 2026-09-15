// Корневой модуль auth-service: здесь Nest подключает .env, PostgreSQL и остальные модули.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDatabase } from 'typeorm-extension';
import type { DataSourceOptions } from 'typeorm';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbName = configService.get<string>('DB_NAME');
        const options: DataSourceOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: Number(configService.get('DB_PORT', 5432)),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          // database: configService.get<string>('DB_NAME'),
          database: dbName || 'pizza_delivery', 
          entities: [User],
          // По классу User TypeORM создаёт/обновляет таблицу users. 
          synchronize: true,
          // В логах будут SQL-команды CREATE TABLE — так проще понять, что схема применилась.
          logging: ['error', 'schema', 'warn'],
        };

        // Для typeorm-extension критически важно указать первоначальное подключение 
        // к системной базе 'postgres', чтобы иметь права создать вашу кастомную базу!
        await createDatabase({
          options,
          initialDatabase: 'postgres', // <--- ТЕПЕРЬ ОН ПОДКЛЮЧИТСЯ К СИСТЕМНОЙ БД И НЕ УПАДЕТ
          ifNotExist: true,
        });

        return options;
      },
    }),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
