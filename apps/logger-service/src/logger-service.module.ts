import { Module } from '@nestjs/common';
import { LoggerServiceController } from './logger-service.controller';
import { LoggerServiceService } from './logger-service.service';

@Module({
  imports: [],
  controllers: [LoggerServiceController],
  providers: [LoggerServiceService],
})
export class LoggerServiceModule {}
