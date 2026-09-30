import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import * as Entities from '@shared/entities';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { IUserRepository } from './interfaces/user-repository.interface';
import { PostgresUserRepository } from './repositories/postgres-user.repository';

// Для перехода на MongoDB
// import { MongooseModule } from '@nestjs/mongoose';
// import { MongoUser, MongoUserSchema } from './schemas/user.schema';
// import { MongoUserRepository } from './repositories/mongo-user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entities.User]),

    // Для перехода на MongoDB - регистрируем схему для MongoDB
    // MongooseModule.forFeature([
    //   { name: MongoUser.name, schema: MongoUserSchema },
    // ]),

    ClientsModule.registerAsync([
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
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,

    // связываем абстракцию и реальную базу данных
    {
      provide: IUserRepository,
      useClass: PostgresUserRepository,
      // useClass: MongoUserRepository // Для перехода на MongoDB
    },
  ],
  exports: [UsersService, IUserRepository, TypeOrmModule],
})
export class UsersModule {}
