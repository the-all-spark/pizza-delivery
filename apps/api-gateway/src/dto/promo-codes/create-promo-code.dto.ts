// DTO для создания промокода

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty({
    example: 'PIZZA2026',
    description: 'Уникальный текстовый код купона',
    maxLength: 50,
  })
  @IsString({ message: 'Промокод должен быть строкой' })
  @IsNotEmpty({ message: 'Промокод не может быть пустым' })
  @MaxLength(50, { message: 'Промокод не должен превышать 50 символов' })
  code: string;

  @ApiProperty({ example: 15, description: 'Процент скидки (от 1 до 100)' })
  @IsInt({ message: 'Процент скидки должен быть целым числом' })
  @Min(1, { message: 'Скидка не может быть меньше 1%' })
  @Max(100, { message: 'Скидка не может быть больше 100%' })
  discountPercent: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Дата и время окончания действия промокода ISO-8601',
  })
  @IsDateString({}, { message: 'Некорректный формат даты (ожидается ISO строка)' })
  @IsNotEmpty({ message: 'Дата окончания действия обязательна' })
  expiresAt: string;

  @ApiProperty({
    example: true,
    description: 'Активен ли промокод в данный момент',
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'Поле isActive должно быть логического типа (true/false)' })
  isActive?: boolean = true;
}
