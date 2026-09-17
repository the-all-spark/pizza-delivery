// DTO ответа

import { ApiProperty } from '@nestjs/swagger';
import { PizzaResponseDto } from '../pizzas/pizza-response.dto';

export class CartItemResponseDto {
  @ApiProperty({ example: 12, description: 'ID элемента корзины (cartId из базы)' })
  cartId: number;

  @ApiProperty({ example: 1, description: 'ID пользователя' })
  userId: number;

  @ApiProperty({ example: 1, description: 'ID пиццы' })
  pizzaId: number;

  @ApiProperty({ example: 2, description: 'Количество пицц данной позиции' })
  quantity: number;

  @ApiProperty({ description: 'Детали вложенной сущности пиццы', type: PizzaResponseDto })
  pizza: PizzaResponseDto;
}
