import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './order.service';
import type {
  CreateOrderPayload,
  GetUserOrdersPayload,
  GetOrderStatusPayload,
  AdminUpdateStatusPayload,
  AdminGetAllOrdersPayload,
} from './order-interfaces';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // * Оформление заказа из корзины (POST /orders)
  @MessagePattern('create_order')
  async createOrder(@Payload() payload: CreateOrderPayload) {
    return this.ordersService.createOrder(payload);
  }

  // * Получение истории заказов (Админ видит все, юзер — свои)
  @MessagePattern('get_user_orders_history')
  async getUserOrdersHistory(@Payload() payload: GetUserOrdersPayload) {
    return this.ordersService.getUserOrdersHistory(payload);
  }

  @MessagePattern('admin_get_all_orders')
  async adminGetAllOrders(@Payload() payload: AdminGetAllOrdersPayload) {
    return this.ordersService.adminGetAllOrders(payload);
  }

  // * Получение статуса конкретного заказа по ID (GET /orders/:id)
  @MessagePattern('get_order_status')
  async getOrderStatus(@Payload() payload: GetOrderStatusPayload) {
    return this.ordersService.getOrderStatus(payload);
  }

  // * Изменение статуса заказа администратором (PATCH /orders/:id)
  @MessagePattern('admin_update_order_status')
  async adminUpdateOrderStatus(@Payload() payload: AdminUpdateStatusPayload) {
    return this.ordersService.adminUpdateOrderStatus(payload);
  }

  // ==========================================
  // МИКРОСЕРВИСНЫЕ МАРШРУТЫ ДЛЯ АНАЛИТИКИ
  // ==========================================

  // * Аналитика 1: Самая популярная пицца за выбранный месяц
  @MessagePattern('get_most_popular_pizza_of_month')
  async getMostPopularPizzaOfMonth(@Payload() data: { month: number; year: number }) {
    return this.ordersService.getMostPopularPizzaOfMonth(data.month, data.year);
  }

  // * Аналитика 2: Поиск премиум-пользователей с чеком выше среднего
  @MessagePattern('get_premium_users_analytics')
  async getPremiumUsersWithHighAverageCheck() {
    return this.ordersService.getPremiumUsersWithHighAverageCheck();
  }
}
