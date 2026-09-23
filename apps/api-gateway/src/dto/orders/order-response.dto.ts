// DTO ответа заказа

import { ApiProperty } from '@nestjs/swagger';
import { OrderItemResponseDto } from './order-item-response.dto';
import { OrderStatus } from '@shared/enums';

export class OrderResponseDto {
  @ApiProperty({ example: 55, description: 'ID of the placed order' })
  orderId: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  userId: number;

  @ApiProperty({ example: '10 Lenin St, Minsk', description: 'Delivery address' })
  address: string;

  @ApiProperty({ example: 50, description: 'Total order price including promo code discount' })
  totalPrice: number;

  @ApiProperty({ example: OrderStatus.PENDING, enum: OrderStatus, description: 'Current execution status' })
  status: OrderStatus;

  @ApiProperty({ example: '2026-03-31T15:00:00.000Z', description: 'Receipt creation time' })
  createdAt: Date;

  @ApiProperty({ description: 'Nested receipt items (pizza snapshots)', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
}
