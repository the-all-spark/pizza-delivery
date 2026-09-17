// DTO для создания пиццы

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsArray, IsInt, ArrayNotEmpty, MaxLength } from 'class-validator';

export class CreatePizzaDto {
  @ApiProperty({ example: 'Пепперони', description: 'Название пиццы', maxLength: 255 })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(255, { message: 'Название не должно превышать 255 символов' })
  title: string;

  @ApiProperty({ example: 'Классическая пицца с пикантной пепперони и моцареллой', description: 'Описание пиццы' })
  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание не может быть пустым' })
  description: string;

  @ApiProperty({ example: 'https://example.com', description: 'Ссылка на изображение пиццы', maxLength: 500 })
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @IsNotEmpty({ message: 'Ссылка на изображение не может быть пустой' })
  @MaxLength(500, { message: 'Ссылка не должна превышать 500 символов' })
  imageUrl: string;

  @ApiProperty({ example: 25.00, description: 'Базовая цена пиццы без учета доп. ингредиентов' })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;

  // поле ingredients - обязательный массив из уникальных чисел (ID ингредиентов)
  @ApiProperty({ example: [1, 2], description: 'Массив ID обязательных ингредиентов для этой пиццы', type: [Number] })
  @IsArray({ message: 'Ингредиенты должны быть переданы в виде массива' })
  @ArrayNotEmpty({ message: 'Пицца не может быть пустой! Добавьте хотя бы один ингредиент' })
  @IsInt({ each: true, message: 'Каждый ID ингредиента должен быть целым числом' })
  ingredients: number[]; // Принимаем массив ID (например, [1, 2])
}
