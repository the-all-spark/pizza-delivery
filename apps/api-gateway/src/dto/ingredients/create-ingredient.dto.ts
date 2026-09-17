// Создание и Обновление

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({
    example: 'Сыр Моцарелла',
    description: 'Уникальное название ингредиента для пиццы',
    maxLength: 150,
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MaxLength(150, { message: 'Название не должно превышать 150 символов' })
  name: string;

  @ApiProperty({
    example: 2.50,
    description: 'Стоимость ингредиента (добавка к базовой цене пиццы)',
    minimum: 0,
  })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;
}
