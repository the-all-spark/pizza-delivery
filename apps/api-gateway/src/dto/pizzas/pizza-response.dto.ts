// DTO успешного ответа

/**
 * также нужно подтянуть созданный ранее IngredientResponseDto, 
 * так как детальный ответ возвращает вложенный массив ингредиентов
 */

import { ApiProperty } from '@nestjs/swagger';
import { IngredientResponseDto } from '../ingredients/ingredient-response.dto';

export class PizzaResponseDto {
  @ApiProperty({ example: 1, description: 'ID пиццы' })
  pId: number;

  @ApiProperty({ example: 'Пепперони', description: 'Название пиццы' })
  title: string;

  @ApiProperty({ example: 'Вкусная пицца', description: 'Описание пиццы' })
  description: string;

  @ApiProperty({ example: 'https://example.com', description: 'Ссылка на изображение' })
  imageUrl: string;

  @ApiProperty({ example: 25.00, description: 'Цена пиццы' })
  price: number;

  @ApiProperty({ example: '2026-03-31T12:00:00.000Z', description: 'Дата добавления в меню' })
  createdAt: Date;

  @ApiProperty({ example: null, description: 'Дата последнего заказа этой пиццы', nullable: true })
  lastOrderedAt: Date;

  @ApiProperty({ description: 'Список связанных ингредиентов пиццы', type: [IngredientResponseDto] })
  ingredients: IngredientResponseDto[];
}
