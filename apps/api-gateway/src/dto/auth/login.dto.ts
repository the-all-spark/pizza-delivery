// * DTO для валидации входящих данных при входе (/auth/login)

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта пользователя',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Некорректный формат электронной почты' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @MaxLength(255, { message: 'Email не должен превышать 255 символов' })
  email: string;

  @ApiProperty({
    example: 'SecretPassword123',
    description: 'Пароль пользователя',
    minLength: 6,
    maxLength: 255,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(255, { message: 'Пароль не должен превышать 255 символов' })
  password: string;
}
