// DTO для создания заказа

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

import { DeliveryMethod, PaymentMethod } from '@shared/enums';

export class CreateOrderDto {
  @ApiProperty({ example: '10 Lenin St, Apt 25, Minsk', description: 'Order delivery address' })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Delivery address cannot be empty' })
  address: string;

  @ApiProperty({
    example: DeliveryMethod.COURIER,
    enum: DeliveryMethod,
    description: 'Delivery method (courier/pickup)',
  })
  @IsEnum(DeliveryMethod, { message: 'Invalid delivery method. Allowed: courier, pickup' })
  deliveryMethod: DeliveryMethod;

  @ApiProperty({
    example: PaymentMethod.CARD_ONLINE,
    enum: PaymentMethod,
    description: 'Payment method (cash/card_online/card_courier)',
  })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    example: 'Intercom code 1001, do not call the courier, the cat gets scared',
    description: 'Order comment',
  })
  @IsOptional()
  @IsString({ message: 'Comment must be a string' })
  comment?: string;

  @ApiPropertyOptional({
    example: 'PIZZA2026',
    description: 'Text promo code to get a discount on this order',
  })
  @IsOptional()
  @IsString({ message: 'Promo code must be a string' })
  @MaxLength(50, { message: 'Promo code must not exceed 50 characters' })
  promoCode?: string;
}
