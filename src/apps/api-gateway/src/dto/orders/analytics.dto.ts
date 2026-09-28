// Схемы дя отображения аналитики в Swagger

import { ApiProperty } from '@nestjs/swagger';

export class PopularPizzaResponseDto {
  @ApiProperty({ example: 4, description: 'ID of the most popular pizza' })
  pizzaId: number;

  @ApiProperty({ example: 'Pepperoni', description: 'Pizza title' })
  title: string;

  @ApiProperty({
    example: 45,
    description: 'Total number of units sold during the month',
  })
  totalQuantity: number;
}

export class PremiumUserAnalyticsResponseDto {
  @ApiProperty({ example: 12, description: 'ID of the premium user' })
  userId: number;

  @ApiProperty({ example: 42.5, description: 'Average check amount of this user' })
  averageCheck: number;

  @ApiProperty({ example: 5, description: 'Total number of successful orders' })
  ordersCount: number;
}
