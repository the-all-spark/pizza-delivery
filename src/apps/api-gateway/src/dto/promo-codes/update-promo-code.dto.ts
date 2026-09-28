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
    description: 'New promo code text',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Promo code must be a string' })
  @MaxLength(50, { message: 'Promo code must not exceed 50 characters' })
  code?: string;

  @ApiPropertyOptional({ example: 20, description: 'New discount percentage' })
  @IsOptional()
  @IsInt({ message: 'Discount percentage must be an integer' })
  @Min(1, { message: 'Discount cannot be less than 1%' })
  @Max(100, { message: 'Discount cannot be greater than 100%' })
  discountPercent?: number;

  @ApiPropertyOptional({
    example: '2027-01-01T00:00:00.000Z',
    description: 'New expiration date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  expiresAt?: string;

  @ApiPropertyOptional({ example: false, description: 'Deactivation/Activation of the promo code' })
  @IsOptional()
  @IsBoolean({ message: 'isActive field must be true/false' })
  isActive?: boolean;
}
