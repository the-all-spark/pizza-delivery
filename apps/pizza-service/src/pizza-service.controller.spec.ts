import { Test, TestingModule } from '@nestjs/testing';
import { PizzaServiceController } from './pizza-service.controller';
import { PizzaServiceService } from './pizza-service.service';

describe('PizzaServiceController', () => {
  let pizzaServiceController: PizzaServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PizzaServiceController],
      providers: [PizzaServiceService],
    }).compile();

    pizzaServiceController = app.get<PizzaServiceController>(PizzaServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(pizzaServiceController.getHello()).toBe('Hello World!');
    });
  });
});
