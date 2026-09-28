import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

// Импортируем сущности смежных модулей микросервиса
import { CartItem } from '../cart/cart-item.entity';
import { PromoCode } from '../promo-codes/promo-code.entity';
import { Pizza } from '../pizzas/pizza.entity';

@Module({
  imports: [
    // Регистрируем все сущности, репозитории которых запрашивает OrdersService
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, PromoCode, Pizza]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
