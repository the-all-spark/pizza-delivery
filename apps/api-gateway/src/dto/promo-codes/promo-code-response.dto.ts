// DTO ответа

import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeResponseDto {
  @ApiProperty({ example: 1, description: 'ID промокода в базе данных' })
  promoId: number;

  @ApiProperty({ example: 'PIZZA2026', description: 'Текст промокода' })
  code: string;

  @ApiProperty({ example: 15, description: 'Процент предоставляемой скидки' })
  discountPercent: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Дата окончания действия купона',
  })
  expiresAt: Date;

  @ApiProperty({ example: true, description: 'Статус активности промокода' })
  isActive: boolean;
}
