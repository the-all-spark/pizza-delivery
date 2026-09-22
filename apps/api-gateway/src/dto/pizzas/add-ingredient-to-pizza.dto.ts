// DTO для добавления одного ингредиента

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddIngredientToPizzaDto {
  @ApiProperty({ example: 4, description: 'ID of the specific ingredient being added to the pizza' })
  @IsInt({ message: 'Ingredient ID must be an integer' })
  @IsNotEmpty({ message: 'Ingredient ID is required' })
  ingredientId: number;
}
