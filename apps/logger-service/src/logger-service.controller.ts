import { Controller, Get } from '@nestjs/common';
import { LoggerServiceService } from './logger-service.service';

@Controller()
export class LoggerServiceController {
  constructor(private readonly loggerServiceService: LoggerServiceService) {}

  @Get()
  getHello(): string {
    return this.loggerServiceService.getHello();
  }
}
