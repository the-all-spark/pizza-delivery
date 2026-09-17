// DTO добавления пиццы в корзину

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID добавляемой пиццы' })
  @IsInt({ message: 'ID пиццы должен быть целым числом' })
  pizzaId: number;

  @ApiProperty({ example: 1, description: 'Количество пицц', default: 1, required: false })
  @IsOptional()
  @IsInt({ message: 'Количество должно быть целым числом' })
  @IsPositive({ message: 'Количество должно быть больше 0' })
  quantity?: number = 1; // По умолчанию 1 штука
}
