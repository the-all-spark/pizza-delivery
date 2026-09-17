// DTO ответа позиции заказа

import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ example: 1, description: 'ID позиции' })
  id: number;

  @ApiProperty({ example: 'Пепперони', description: 'Снимок названия пиццы на момент покупки' })
  titleSnapshot: string;

  @ApiProperty({ example: 599.00, description: 'Снимок цены пиццы на момент покупки' })
  priceSnapshot: number;

  @ApiProperty({ example: 2, description: 'Количество (штук)' })
  quantity: number;
}
