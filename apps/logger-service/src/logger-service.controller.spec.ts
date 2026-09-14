import { Test, TestingModule } from '@nestjs/testing';
import { LoggerServiceController } from './logger-service.controller';
import { LoggerServiceService } from './logger-service.service';

describe('LoggerServiceController', () => {
  let loggerServiceController: LoggerServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LoggerServiceController],
      providers: [LoggerServiceService],
    }).compile();

    loggerServiceController = app.get<LoggerServiceController>(LoggerServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(loggerServiceController.getHello()).toBe('Hello World!');
    });
  });
});
