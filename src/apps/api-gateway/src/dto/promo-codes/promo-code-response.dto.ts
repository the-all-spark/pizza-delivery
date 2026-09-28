// DTO ответа (промокод)

import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeResponseDto {
  @ApiProperty({ example: 1, description: 'Promo code ID in the database' })
  promoId: number;

  @ApiProperty({ example: 'PIZZA2026', description: 'Promo code text' })
  code: string;

  @ApiProperty({ example: 15, description: 'Provided discount percentage' })
  discountPercent: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Coupon expiration date',
  })
  expiresAt: Date;

  @ApiProperty({ example: true, description: 'Promo code activity status' })
  isActive: boolean;
}
