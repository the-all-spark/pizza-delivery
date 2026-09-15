import { Injectable } from '@nestjs/common';

@Injectable()
export class IngredientServiceService {
  getHello(): string {
    return 'Hello from IngredientServiceService!';
  }
}
