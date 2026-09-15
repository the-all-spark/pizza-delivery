
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerServiceService } from './logger-service.service';
import { LoggerServiceConsumer } from './logger-service.consumer';
// import { LoggerServiceController } from './logger-service.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [
    LoggerServiceService, 
    LoggerServiceConsumer
  ],
  // Если у вас есть контроллеры, добавьте их, если нет — удалите свойство controllers
  // controllers: [LoggerServiceController],
})
export class LoggerServiceModule {}

