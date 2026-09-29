// Корневой модуль auth-service: здесь Nest подключает .env, PostgreSQL и остальные модули.

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDatabase } from 'typeorm-extension';
import type { DataSourceOptions } from 'typeorm';
// import { MongooseModule } from '@nestjs/mongoose';

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
          database: dbName || 'pizza_delivery',
          entities: [User],
          synchronize: true,
          logging: ['error', 'schema', 'warn'],
        };

        await createDatabase({
          options,
          initialDatabase: 'postgres',
          ifNotExist: true,
        });

        return options;
      },
    }),

    // Для перехода на MongoDB - активируем подключение к MongoDB
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGO_URI_AUTH'),
    //   }),
    // }),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
