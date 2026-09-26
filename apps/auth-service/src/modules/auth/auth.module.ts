// * Модуль авторизации микросервиса auth-service

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';

@Module({
  imports: [
    // 1. Регистрируем сущность User в TypeORM для этого модуля
    TypeOrmModule.forFeature([User]),

    // Регистрируем клиент RabbitMQ для отправки событий уведомлений
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'notification_queue', // Очередь для отправки писем
            queueOptions: { durable: true },
          },
        }),
      },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController], // Подключаем контроллер, слушающий RabbitMQ
  providers: [AuthService], // Подключаем сервис с бизнес-логикой
  exports: [AuthService], // Экспортируем сервис на случай, если он понадобится другим модулям
})
export class AuthModule {}
