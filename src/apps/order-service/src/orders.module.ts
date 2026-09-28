import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../orders/orders.service';

import { Order } from '../orders/order.entity';
import { OrderItem } from './order-item.entity';

// Импортируем сущности смежных модулей микросервиса
import { CartItem } from '../../cart-service/src/cart-item.entity';
import { PromoCode } from '../../pizza-service/src/modules/promo-codes/promo-code.entity';
import { Pizza } from '../../pizza-service/src/pizza.entity';

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
