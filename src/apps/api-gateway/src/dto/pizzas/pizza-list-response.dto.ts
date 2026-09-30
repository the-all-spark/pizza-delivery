import { ApiProperty } from '@nestjs/swagger';
import { PizzaResponseDto } from './pizza-response.dto';

export class PizzaListResponseDto {
  @ApiProperty({
    type: [PizzaResponseDto],
    description: 'Array of pizza for current page',
  })
  data: PizzaResponseDto[];

  @ApiProperty({ example: 10, description: 'Total number of pizzas in catalog' })
  total: number;

  @ApiProperty({ example: 2, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page (limit)' })
  limit: number;
}
