import { ApiProperty } from '@nestjs/swagger';
import { PizzaResponseDto } from '../pizzas/pizza-response.dto';

export class CartItemResponseDto {
  @ApiProperty({
    example: 12,
    description: 'Cart item ID (cartId from database)',
  })
  cartId: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  userId: number;

  @ApiProperty({ example: 1, description: 'Pizza ID' })
  pizzaId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of pizzas for this position',
  })
  quantity: number;

  @ApiProperty({
    description: 'Details of the nested pizza entity',
    type: PizzaResponseDto,
  })
  pizza: PizzaResponseDto;
}
