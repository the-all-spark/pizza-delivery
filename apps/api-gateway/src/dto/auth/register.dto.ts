// * DTO для валидации входящих данных при регистрации (/auth/register)
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

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
    description: 'User email (must be unique)',
    maxLength: 255,
  })
  // декораторы class-validator для защиты сервера
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({
    example: 'SecretPassword123',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
    maxLength: 255,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(255, { message: 'Password must not exceed 255 characters' })
  password: string;

  @ApiProperty({
    example: 'Ivan',
    description: 'User first name',
    maxLength: 100,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  firstName: string;

  @ApiProperty({
    example: 'Ivanov',
    description: 'User last name',
    maxLength: 100,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
  lastName: string;
}
