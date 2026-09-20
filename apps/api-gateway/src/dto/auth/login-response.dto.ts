// * То, что фронтенд ожидает получить для сохранения в localStorage или куки

import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for authorizing subsequent requests',
  })
  accessToken: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Token type',
  })
  tokenType: string;
}
