// * Контроллер заказов

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Inject,
  UseFilters,
  Req,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import { CreateOrderDto } from '../dto/orders/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/orders/update-order-status.dto';
import { OrderResponseDto } from '../dto/orders/order-response.dto';
import { OrderPaginationQueryDto } from '../dto/orders/order-pagination-query.dto';
import {
  PopularPizzaResponseDto,
  PremiumUserAnalyticsResponseDto,
} from '../dto/orders/analytics.dto';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@ApiTags('Orders')
@ApiBearerAuth('bearerAuth')
@Controller('orders')
@UseFilters(RpcExceptionFilter)
export class OrdersGatewayController {
  constructor(@Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy) {}

  // ==========================================
  // ЭНДПОИНТЫ АНАЛИТИКИ (ДОСТУПНО ТОЛЬКО ADMIN)
  // ==========================================

  // * Найти самую популярную пиццу за выбранный месяц (GET /orders/analytics/popular-pizza)
  @Get('analytics/popular-pizza')
  @Roles('admin')
  @ApiOperation({
    summary: 'Analytics: Most popular pizza of the month',
    description:
      'Available only to administrators. Returns the pizza that was ordered most frequently during the selected month and year.',
  })
  @ApiQuery({
    name: 'month',
    type: Number,
    example: 9,
    description: 'Month number (1-12)',
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    example: 2026,
    description: 'Calendar year',
  })
  @ApiOkResponse({
    description: 'Popular pizza analytics successfully generated.',
    type: PopularPizzaResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied (admin role required).',
  })
  getPopularPizza(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.pizzaClient.send('get_most_popular_pizza_of_month', {
      month,
      year,
    });
  }

  // * Найти премиум-пользователей со средним чеком выше среднего (GET /orders/analytics/premium-users)
  @Get('analytics/premium-users')
  @Roles('admin')
  @ApiOperation({
    summary: 'Analytics: Search for premium clients',
    description:
      'Available only to administrators. Finds users with order count >= 3, whose average check amount is greater than or equal to the average check amount across the entire system.',
  })
  @ApiOkResponse({
    description: 'Premium users list successfully retrieved.',
    type: [PremiumUserAnalyticsResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied (admin role required).',
  })
  getPremiumUsers() {
    return this.pizzaClient.send('get_premium_users_analytics', {});
  }

  // ==========================================
  // СТАНДАРТНЫЕ МАРШРУТЫ ЗАКАЗОВ
  // ==========================================

  // * Получить список заказов (Пользователь: своя история заказов | Админ: все заказы в системе)
  // GET /orders?page=1&limit=10
  @Get()
  @Roles('admin', 'user')
  @ApiOperation({
    summary: 'Get a list of orders with pagination',
    description:
      'For administrators, returns a chunk of all active orders in the system. For users, returns a chunk of their personal order history.',
  })
  @ApiOkResponse({ description: 'Order list successfully retrieved with pagination metadata.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getOrders(@Req() req: AuthenticatedRequest, @Query() query: OrderPaginationQueryDto) {
    const paginationParams = {
      page: query.page,
      limit: query.limit,
    };

    if (req.user.role.includes('admin')) {
      return this.pizzaClient.send('admin_get_all_orders', paginationParams);
    }

    return this.pizzaClient.send('get_user_orders_history', {
      userId: req.user.userId,
      ...paginationParams,
    });
  }

  // * Сделать заказ (POST /orders)
  @Post()
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Place an order from cart',
    description:
      'Takes all items from the current user cart, applies a promo code (if provided), snapshots the prices, and clears the cart.',
  })
  @ApiCreatedResponse({
    description: 'Order successfully created and sent to the kitchen.',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or empty user cart.',
  })
  @ApiResponse({
    status: 404,
    description: 'The specified promo code does not exist or has expired.',
  })
  createOrder(@Req() req: AuthenticatedRequest, @Body() body: CreateOrderDto) {
    return this.pizzaClient.send('create_order', {
      userId: req.user.userId,
      ...body,
    });
  }

  // * Получить информацию/статус конкретного заказа по его ID (GET /orders/:id)
  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Get information about a specific order by ID',
    description:
      'Allows a client or administrator to view the current status and details of a specific order.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique order identifier',
    example: 105,
  })
  @ApiOkResponse({
    description: 'Order information successfully retrieved.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  getOrder(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('get_order_status', {
      userId: req.user.userId,
      orderId: id,
      role: req.user.role,
    });
  }

  // * Изменить статус заказа по его ID (PATCH /orders/:id)
  @Patch(':id')
  @Roles('admin')
  @ApiOperation({
    summary: 'Change order execution status',
    description:
      'Available only to administrators. Advances the order to stages such as processing, delivering, completed, etc.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique order identifier',
    example: 105,
  })
  @ApiOkResponse({
    description: 'Order status successfully updated.',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or incorrect status.',
  })
  @ApiResponse({ status: 404, description: 'Order with the specified ID not found.' })
  @ApiResponse({
    status: 403,
    description: 'Access denied (admin role required).',
  })
  updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateOrderStatusDto) {
    return this.pizzaClient.send('admin_update_order_status', {
      orderId: id,
      status: body.status,
    });
  }
}
