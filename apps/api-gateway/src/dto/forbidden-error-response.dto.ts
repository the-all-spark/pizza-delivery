import { ApiProperty } from '@nestjs/swagger';

export class ForbiddenErrorResponseDto {
  @ApiProperty({ example: 'You do not have sufficient permissions to access this resource.' })
  message: string;

  @ApiProperty({ example: 'Forbidden' })
  error: string;

  @ApiProperty({ example: 403 })
  statusCode: number;
}
