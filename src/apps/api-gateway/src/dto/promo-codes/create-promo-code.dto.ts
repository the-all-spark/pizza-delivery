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
    description: 'Unique text code of the coupon',
    maxLength: 50,
  })
  @IsString({ message: 'Promo code must be a string' })
  @IsNotEmpty({ message: 'Promo code cannot be empty' })
  @MaxLength(50, { message: 'Promo code must not exceed 50 characters' })
  code: string;

  @ApiProperty({ example: 15, description: 'Discount percentage (from 1 to 100)' })
  @IsInt({ message: 'Discount percentage must be an integer' })
  @Min(1, { message: 'Discount cannot be less than 1%' })
  @Max(100, { message: 'Discount cannot be greater than 100%' })
  discountPercent: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiration date and time of the promo code in ISO-8601 format',
  })
  @IsDateString({}, { message: 'Invalid date format (ISO string expected)' })
  @IsNotEmpty({ message: 'Expiration date is required' })
  expiresAt: string;

  @ApiProperty({
    example: true,
    description: 'Whether the promo code is currently active',
    default: true,
    required: false,
  })
  @IsBoolean({ message: 'isActive field must be a boolean type (true/false)' })
  isActive?: boolean = true;
}
