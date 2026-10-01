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

  @MessagePattern('create_order')
  async createOrder(@Payload() payload: CreateOrderPayload) {
    return this.ordersService.createOrder(payload);
  }

  @MessagePattern('get_user_orders_history')
  async getUserOrdersHistory(@Payload() payload: GetUserOrdersPayload) {
    return this.ordersService.getUserOrdersHistory(payload);
  }

  @MessagePattern('admin_get_all_orders')
  async adminGetAllOrders(@Payload() payload: AdminGetAllOrdersPayload) {
    return this.ordersService.adminGetAllOrders(payload);
  }

  @MessagePattern('get_order_status')
  async getOrderStatus(@Payload() payload: GetOrderStatusPayload) {
    return this.ordersService.getOrderStatus(payload);
  }

  @MessagePattern('admin_update_order_status')
  async adminUpdateOrderStatus(@Payload() payload: AdminUpdateStatusPayload) {
    return this.ordersService.adminUpdateOrderStatus(payload);
  }

  @MessagePattern('get_most_popular_pizza_of_month')
  async getMostPopularPizzaOfMonth(@Payload() data: { month: number; year: number }) {
    return this.ordersService.getMostPopularPizzaOfMonth(data.month, data.year);
  }

  @MessagePattern('get_premium_users_analytics')
  async getPremiumUsersWithHighAverageCheck() {
    return this.ordersService.getPremiumUsersWithHighAverageCheck();
  }
}
