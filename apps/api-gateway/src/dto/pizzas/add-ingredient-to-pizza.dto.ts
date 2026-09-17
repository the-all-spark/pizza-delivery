// DTO для добавления одного ингредиента

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddIngredientToPizzaDto {
  @ApiProperty({ example: 4, description: 'ID конкретного ингредиента, который добавляется к пицце' })
  @IsInt({ message: 'ID ингредиента должен быть целым числом' })
  @IsNotEmpty({ message: 'ID ингредиента обязателен для заполнения' })
  ingredientId: number;
}
