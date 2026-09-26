// DTO для обновления пиццы

import { ApiPropertyOptional } from '@nestjs/swagger'; // Используем Optional версию для Swagger
import { IsString, IsNumber, Min, IsOptional, MaxLength } from 'class-validator';

export class UpdatePizzaDto {
  @ApiPropertyOptional({
    example: 'Pepperoni Plus',
    description: 'New pizza title',
    maxLength: 255,
  })
  @IsOptional() // Поле необязательно для передачи
  @IsString({ message: 'Title must be a string' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated description with spicy sausages added',
    description: 'New pizza description',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com',
    description: 'New image link',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Image link must be a string' })
  @MaxLength(500, { message: 'Link must not exceed 500 characters' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: 30.0, description: 'New base pizza price' })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price?: number;
}
