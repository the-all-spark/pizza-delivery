import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './cart-item.entity';
import { Pizza } from '../pizzas/pizza.entity';

@Module({
  imports: [
    // Регистрируем сущности PostgreSQL, чтобы TypeORM создал для них репозитории
    TypeOrmModule.forFeature([CartItem, Pizza]),
  ],
  controllers: [
    CartController, // Подключаем наш контроллер очередей RabbitMQ
  ],
  providers: [
    CartService, // Подключаем бизнес-логику корзины
  ],
  exports: [
    // Экспортируем сервис на случай, если корзина понадобится модулю заказов (Orders)
    CartService,
  ],
})
export class CartModule {}
