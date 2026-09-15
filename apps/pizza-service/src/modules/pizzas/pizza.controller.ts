import { Controller, Get } from '@nestjs/common';
import { PizzaService } from './pizza.service';

@Controller()
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  @Get()
  getHello(): string {
    return this.pizzaService.getHello();
  }
}
