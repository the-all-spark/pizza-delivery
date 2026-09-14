import { Controller, Get } from '@nestjs/common';
import { PizzaServiceService } from './pizza-service.service';

@Controller()
export class PizzaServiceController {
  constructor(private readonly pizzaServiceService: PizzaServiceService) {}

  @Get()
  getHello(): string {
    return this.pizzaServiceService.getHello();
  }
}
