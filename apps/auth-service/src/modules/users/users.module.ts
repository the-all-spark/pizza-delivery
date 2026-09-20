import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

// Импортируем абстрактный контракт и его реальную Postgres-реализацию
import { IUserRepository } from './interfaces/user-repository.interface';
import { PostgresUserRepository } from './repositories/postgres-user.repository';

// Для перехода на MongoDB
// import { MongooseModule } from '@nestjs/mongoose';
// import { MongoUser, MongoUserSchema } from './schemas/user.schema';
// import { MongoUserRepository } from './repositories/mongo-user.repository';

@Module({
  imports: [
    // 1. Регистрируем сущность User в контексте данного модуля для TypeORM
    TypeOrmModule.forFeature([User]),

    // Для перехода на MongoDB - регистрируем схему для MongoDB
    // MongooseModule.forFeature([
    //   { name: MongoUser.name, schema: MongoUserSchema },
    // ]),

    // 2. Регистрируем клиент RabbitMQ для отправки событий в notification-service
    // Благодаря этому UsersService сможет успешно использовать @Inject('NOTIFICATION_SERVICE')
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
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
            queue: 'notification_queue', // Имя очереди для отправки писем
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,

    // 3. СВЯЗЫВАЕМ ИНТЕРФЕЙС И РЕАЛИЗАЦИЮ (абстракцию и реальную базу данных):
    // Говорим NestJS: "При запросе IUserRepository — внедри PostgresUserRepository"
    {
      provide: IUserRepository,
      useClass: PostgresUserRepository,
      // useClass: MongoUserRepository // Для перехода на MongoDB
    },
  ],
  // Экспортируем UsersService и IUserRepository, чтобы другие модули (например, AuthModule)
  // могли использовать методы работы с пользователями через абстракцию
  exports: [UsersService, IUserRepository, TypeOrmModule],
})
export class UsersModule {}
