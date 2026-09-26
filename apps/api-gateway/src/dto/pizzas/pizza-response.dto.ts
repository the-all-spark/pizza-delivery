// DTO успешного ответа

/**
 * также нужно подтянуть созданный ранее IngredientResponseDto,
 * так как детальный ответ возвращает вложенный массив ингредиентов
 */

import { ApiProperty } from '@nestjs/swagger';
import { IngredientResponseDto } from '../ingredients/ingredient-response.dto';

export class PizzaResponseDto {
  @ApiProperty({ example: 1, description: 'Pizza ID' })
  pId: number;

  @ApiProperty({ example: 'Pepperoni', description: 'Pizza title' })
  title: string;

  @ApiProperty({ example: 'Delicious pizza', description: 'Pizza description' })
  description: string;

  @ApiProperty({ example: 'https://example.com', description: 'Image link' })
  imageUrl: string;

  @ApiProperty({ example: 25.0, description: 'Pizza price' })
  price: number;

  @ApiProperty({ example: '2026-03-31T12:00:00.000Z', description: 'Date added to the menu' })
  createdAt: Date;

  @ApiProperty({ example: null, description: 'Date this pizza was last ordered', nullable: true })
  lastOrderedAt: Date;

  @ApiProperty({ description: 'List of linked pizza ingredients', type: [IngredientResponseDto] })
  ingredients: IngredientResponseDto[];
}
