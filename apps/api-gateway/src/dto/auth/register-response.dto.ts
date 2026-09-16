// * DTO успешного ответа

/*
пароль (даже хэш) клиенту возвращать нельзя, поэтому в DTO ответа его не будет. 
Зато добавим сгенерированный базой данных uId и системное поле createdAt
*/

import { ApiProperty } from '@nestjs/swagger';

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class RegisterResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Уникальный идентификатор пользователя (ID)',
  })
  uId: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта пользователя',
  })
  email: string;

  @ApiProperty({
    example: 'Иван',
    description: 'Имя пользователя',
  })
  firstName: string;

  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия пользователя',
  })
  lastName: string;

  @ApiProperty({
    example: 'user',
    enum: UserRole,
    description: 'Роль пользователя в системе',
  })
  role: UserRole;

  @ApiProperty({
    example: '2026-03-31T12:34:56.789Z',
    description: 'Дата и время создания аккаунта',
  })
  createdAt: Date;
}
