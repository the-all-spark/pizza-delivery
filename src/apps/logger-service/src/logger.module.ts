import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../../apps/logger-service/src/logger.service';
import { LoggerConsumer } from './logger.consumer';
import { Log, LogSchema } from './schemas/log.schema';

@Module({
  imports: [
    // Подключаем ConfigModule, чтобы NestJS умел читать process.env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Асинхронно подключаем MongoDB, забирая MONGO_URI из переменных окружения
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    // Регистрируем схему Log для внедрения модели InjectModel в LoggerService
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
  ],
  controllers: [LoggerConsumer],
  providers: [LoggerService],
})
export class LoggerModule {}
