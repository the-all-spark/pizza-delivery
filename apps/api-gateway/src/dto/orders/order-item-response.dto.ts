// DTO ответа позиции заказа

import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ example: 1, description: 'Unique identifier of the receipt item' })
  id: number;

  @ApiProperty({ example: 1, description: 'Identifier of the associated order' })
  orderId: number;

  @ApiProperty({
    example: 1,
    description:
      'Identifier of the pizza from the menu catalog (accepts null if the pizza has been removed from the general menu)',
    nullable: true,
  })
  pizzaItemId: number | null;

  @ApiProperty({
    example: 'Pepperoni',
    description: 'Snapshot of the pizza title at the time of purchase',
  })
  titleSnapshot: string;

  @ApiProperty({ example: 27, description: 'Snapshot of the pizza price at the time of purchase' })
  priceSnapshot: number;

  @ApiProperty({ example: 2, description: 'Quantity of pizzas ordered (units)' })
  quantity: number;
}
