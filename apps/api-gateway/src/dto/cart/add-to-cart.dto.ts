// DTO добавления пиццы в корзину

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID of the pizza being added' })
  @IsInt({ message: 'Pizza ID must be an integer' })
  pizzaId: number;

  @ApiProperty({
    example: 1,
    description: 'Quantity of pizzas',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Quantity must be an integer' })
  @IsPositive({ message: 'Quantity must be greater than 0' })
  quantity?: number = 1; // По умолчанию 1 штука
}
