// * DTO для валидации входящих данных при регистрации (/auth/register)

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/*
Исключаем из DTO:
- системные поля (uId, createdAt), 
- поле role (так как при регистрации роль обычно выставляется по умолчанию как USER 
на стороне бэкенда ради безопасности), а вместо passwordHash запрашиваем у пользователя 
чистый password, который auth-service захэширует перед сохранением.
*/

export class RegisterDto {
  // декораторы @ApiProperty для автоматической генерации документации в Swagger
  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта пользователя (должна быть уникальной)',
    maxLength: 255,
  })
  // декораторы class-validator для защиты сервера
  @IsEmail({}, { message: 'Некорректный формат электронной почты' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @MaxLength(255, { message: 'Email не должен превышать 255 символов' })
  email: string;

  @ApiProperty({
    example: 'SecretPassword123',
    description: 'Пароль пользователя (минимум 6 символов)',
    minLength: 6,
    maxLength: 255,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(255, { message: 'Пароль не должен превышать 255 символов' })
  password: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя пользователя',
    maxLength: 100,
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не может быть пустым' })
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  firstName: string;

  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия пользователя',
    maxLength: 100,
  })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия не может быть пустой' })
  @MaxLength(100, { message: 'Фамилия не должна превышать 100 символов' })
  lastName: string;
}
