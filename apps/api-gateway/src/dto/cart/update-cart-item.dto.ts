// DTO обновления

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3, description: 'Новое количество пицц для данной позиции в корзине' })
  @IsInt({ message: 'Количество должно быть целым числом' })
  @IsPositive({ message: 'Количество должно быть больше 0' })
  quantity: number;
}
