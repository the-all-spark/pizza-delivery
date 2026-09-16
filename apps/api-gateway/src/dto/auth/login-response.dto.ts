// * То, что фронтенд ожидает получить для сохранения в localStorage или куки

import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT токен доступа для авторизации последующих запросов',
  })
  accessToken: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Тип токена',
  })
  tokenType: string;
}
