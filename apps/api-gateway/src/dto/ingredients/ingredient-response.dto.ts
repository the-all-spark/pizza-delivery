// DTO для исходящих данных (Ответ сервера)
// объект, который возвращается из базы данных

import { ApiProperty } from '@nestjs/swagger';

export class IngredientResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Уникальный идентификатор ингредиента (ID)',
  })
  ingrId: number;

  @ApiProperty({
    example: 'Сыр Моцарелла',
    description: 'Название ингредиента',
  })
  name: string;

  @ApiProperty({
    example: 2.50,
    description: 'Цена ингредиента',
  })
  price: number;
}

