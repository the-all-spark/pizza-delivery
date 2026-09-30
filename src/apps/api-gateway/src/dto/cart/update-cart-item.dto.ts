import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: 'New quantity of pizzas for this position in the cart',
  })
  @IsInt({ message: 'Quantity must be an integer' })
  @IsPositive({ message: 'Quantity must be greater than 0' })
  quantity: number;
}
