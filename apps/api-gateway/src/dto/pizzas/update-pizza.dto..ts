// DTO для обновления пиццы

import { ApiPropertyOptional } from '@nestjs/swagger'; // Используем Optional версию для Swagger
import { IsString, IsNumber, Min, IsOptional, MaxLength } from 'class-validator';

export class UpdatePizzaDto {
  @ApiPropertyOptional({ example: 'Пепперони Плюс', description: 'Новое название пиццы', maxLength: 255 })
  @IsOptional() // Поле необязательно для передачи
  @IsString({ message: 'Название должно быть строкой' })
  @MaxLength(255, { message: 'Название не должно превышать 255 символов' })
  title?: string;

  @ApiPropertyOptional({ example: 'Обновленное описание с добавлением острых колбасок', description: 'Новое описание пиццы' })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com', description: 'Новая ссылка на изображение', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @MaxLength(500, { message: 'Ссылка не должна превышать 500 символов' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: 30.00, description: 'Новая базовая цена пиццы' })
  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;
}

