import { ApiProperty } from '@nestjs/swagger';

// схемы дя отображения аналитике в Swagger

export class PopularPizzaResponseDto {
  @ApiProperty({ example: 4, description: 'ID самой популярной пиццы' })
  pizzaId: number;

  @ApiProperty({ example: 'Пепперони', description: 'Название пиццы' })
  title: string;

  @ApiProperty({
    example: 45,
    description: 'Общее количество проданных единиц за месяц',
  })
  totalQuantity: number;
}

export class PremiumUserAnalyticsResponseDto {
  @ApiProperty({ example: 12, description: 'ID премиум-пользователя' })
  userId: number;

  @ApiProperty({ example: 42.5, description: 'Средний чек этого пользователя' })
  averageCheck: number;

  @ApiProperty({ example: 5, description: 'Общее количество успешных заказов' })
  ordersCount: number;
}
