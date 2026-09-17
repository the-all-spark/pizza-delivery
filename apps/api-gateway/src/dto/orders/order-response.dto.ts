// DTO ответа заказа

import { ApiProperty } from '@nestjs/swagger';
import { OrderItemResponseDto } from './order-item-response.dto';
import { OrderStatus } from '@shared/enums';

export class OrderResponseDto {
  @ApiProperty({ example: 55, description: 'ID оформленного заказа' })
  orderId: number;

  @ApiProperty({ example: 1, description: 'ID пользователя' })
  userId: number;

  @ApiProperty({ example: 'г. Минск, ул. Ленина, д. 10', description: 'Адрес доставки' })
  address: string;

  @ApiProperty({ example: 1049.50, description: 'Итоговая стоимость заказа с учетом промокода' })
  totalPrice: number;

  @ApiProperty({ example: OrderStatus.PENDING, enum: OrderStatus, description: 'Текущий статус выполнения' })
  status: OrderStatus;

  @ApiProperty({ example: '2026-03-31T15:00:00.000Z', description: 'Время оформления чека' })
  createdAt: Date;

  @ApiProperty({ description: 'Вложенные позиции чека (снимки пицц)', type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
}


