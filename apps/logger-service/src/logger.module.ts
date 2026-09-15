import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { LoggerConsumer } from './logger.consumer';
// import { LoggerController } from './logger.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [LoggerService, LoggerConsumer],
  // Если есть контроллеры
  // controllers: [LoggerController],
})
export class LoggerServiceModule {}
