// DTO обновления статуса (для админа)

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import {  OrderStatus } from '@shared/enums';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: OrderStatus.PROCESSING, enum: OrderStatus, description: 'Новый статус для изменения админом' })
  @IsEnum(OrderStatus, { message: 'Указан неверный статус заказа' })
  @IsNotEmpty({ message: 'Статус обязателен для заполнения' })
  status: OrderStatus;
}
