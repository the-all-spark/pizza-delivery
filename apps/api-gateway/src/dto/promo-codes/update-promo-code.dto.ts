// DTO для обновления промокода

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdatePromoCodeDto {
  @ApiPropertyOptional({
    example: 'PIZZA2026_NEW',
    description: 'Новый текст промокода',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Промокод должен быть строкой' })
  @MaxLength(50, { message: 'Промокод не должен превышать 50 символов' })
  code?: string;

  @ApiPropertyOptional({ example: 20, description: 'Новый процент скидки' })
  @IsOptional()
  @IsInt({ message: 'Процент скидки должен быть целым числом' })
  @Min(1, { message: 'Скидка не может быть меньше 1%' })
  @Max(100, { message: 'Скидка не может быть больше 100%' })
  discountPercent?: number;

  @ApiPropertyOptional({
    example: '2027-01-01T00:00:00.000Z',
    description: 'Новая дата окончания действия',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Некорректный формат даты' })
  expiresAt?: string;

  @ApiPropertyOptional({ example: false, description: 'Деактивация/Активация промокода' })
  @IsOptional()
  @IsBoolean({ message: 'Поле isActive должно быть true/false' })
  isActive?: boolean;
}
