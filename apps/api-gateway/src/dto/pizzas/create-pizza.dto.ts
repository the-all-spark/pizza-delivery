// DTO для создания пиццы
// используется формат multipart/form-data

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsNumberString,
} from 'class-validator';

export class CreatePizzaDto {
  @ApiProperty({
    example: 'Пепперони',
    description: 'Название пиццы',
    maxLength: 255,
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(255, { message: 'Название не должно превышать 255 символов' })
  title: string;

  @ApiProperty({
    example: 'Классическая пицца с пикантной пепперони и моцареллой',
    description: 'Описание пиццы',
  })
  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание не может быть пустым' })
  description: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл изображения пиццы (PNG/JPG)',
  })
  image: any; // Этот декоратор заставляет Swagger отобразить кнопку выбора файла

  @ApiProperty({ example: '25.00', description: 'Базовая цена пиццы' })
  @IsNumberString({}, { message: 'Цена должна быть корректным числом' })
  @IsNotEmpty({ message: 'Цена не может быть пустой' })
  price: string; // В multipart/form-data все текстовые поля прилетают как string (приведем к числу в контроллере)

  // поле ingredients принимает строку с ID ингредиентов
  @ApiProperty({
    example: '1,2,3,5',
    description:
      'ID ингредиентов для этой пиццы, перечисленные через запятую (БЕЗ ПРОБЕЛОВ) или в формате [1,2,3,5]',
    type: String,
  })
  @IsString({
    message: 'Ингредиенты должны быть переданы в виде текстовой строки',
  })
  @IsNotEmpty({
    message: 'Пицца не может быть пустой! Добавьте хотя бы один ингредиент',
  })
  ingredients: any; // Меняем тип на any/string для прохождения первичной валидации
}
