// * DTO успешного ответа

import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@shared/enums';

export class RegisterResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique user identifier (ID)',
  })
  uId: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  lastName: string;

  @ApiProperty({
    example: 'user',
    enum: UserRole,
    description: 'User role in the system',
  })
  role: UserRole;

  @ApiProperty({
    example: '2026-03-31T12:34:56.789Z',
    description: 'Account creation date and time',
  })
  createdAt: Date;
}
