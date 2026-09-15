import { Controller, Get } from '@nestjs/common';
import { IngredientServiceService } from './ingredient.service';

@Controller()
export class IngredientServiceController {
  constructor(private readonly ingredientServiceService: IngredientServiceService) {}

  @Get()
  getHello(): string {
    return this.ingredientServiceService.getHello();
  }
}
