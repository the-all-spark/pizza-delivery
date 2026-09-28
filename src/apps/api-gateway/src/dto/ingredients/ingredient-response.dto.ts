// DTO для исходящих данных

import { ApiProperty } from '@nestjs/swagger';

export class IngredientResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique ingredient identifier (ID)',
  })
  ingrId: number;

  @ApiProperty({
    example: 'Mozzarella Cheese',
    description: 'Ingredient name',
  })
  name: string;

  @ApiProperty({
    example: 2.5,
    description: 'Ingredient price',
  })
  price: number;
}
