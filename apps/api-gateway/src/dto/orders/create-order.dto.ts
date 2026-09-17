// DTO для создания заказа

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

import { DeliveryMethod, PaymentMethod } from '@shared/enums';

export class CreateOrderDto {
  @ApiProperty({ example: 'г. Минск, ул. Ленина, д. 10, кв. 25', description: 'Адрес доставки заказа' })
  @IsString({ message: 'Адрес должен быть строкой' })
  @IsNotEmpty({ message: 'Адрес доставки не может быть пустым' })
  address: string;

  @ApiProperty({ example: DeliveryMethod.COURIER, enum: DeliveryMethod, description: 'Способ доставки (courier/pickup)' })
  @IsEnum(DeliveryMethod, { message: 'Неверный способ доставки. Допустимы: courier, pickup' })
  deliveryMethod: DeliveryMethod;

  @ApiProperty({ example: PaymentMethod.CARD_ONLINE, enum: PaymentMethod, description: 'Способ оплаты (cash/card_online/card_courier)' })
  @IsEnum(PaymentMethod, { message: 'Неверный способ оплаты' })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'Домофон 1001, курьеру не звонить, кот пугается', description: 'Комментарий к заказу' })
  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  comment?: string;

  @ApiPropertyOptional({ example: 'PIZZA2026', description: 'Текстовый промокод для получения скидки на этот заказ' })
  @IsOptional()
  @IsString({ message: 'Промокод должен быть строкой' })
  @MaxLength(50, { message: 'Промокод не должен превышать 50 символов' })
  promoCode?: string; // передаем строку купона прямо сюда для добавления промокода к заказу
}


