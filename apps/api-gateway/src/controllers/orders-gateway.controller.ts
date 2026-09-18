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
  ParseIntPipe
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
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import { CreateOrderDto } from '../dto/orders/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/orders/update-order-status.dto';
import { OrderResponseDto } from '../dto/orders/order-response.dto';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@ApiTags('Orders')
@ApiBearerAuth('bearerAuth')
@Controller('orders')
@UseFilters(RpcExceptionFilter)
export class OrdersGatewayController {
  constructor(
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy
  ) {}

  // * Получить список заказов (Пользователь: своя история заказов | Админ: все заказы в системе)
  // GET /orders
  @Get()
  @Roles('admin', 'user')
  @ApiOperation({ 
    summary: 'Получить список заказов', 
    description: 'Для администратора возвращает все активные заказы в системе. Для пользователя — историю его собственных заказов.' 
  })
  @ApiOkResponse({ description: 'Список заказов успешно получен.', type: [OrderResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  getOrders(@Req() req: AuthenticatedRequest) {
    // Разделяем логику на основе роли пользователя из JWT-токена
    if (req.user.role.includes('admin')) {
      return this.pizzaClient.send('admin_get_all_orders', {});
    }
    
    return this.pizzaClient.send('get_user_orders_history', { userId: req.user.userId });
  }

  // * Сделать заказ (POST /orders)
  @Post()
  @Roles('user', 'admin')
  @ApiOperation({ 
    summary: 'Оформить заказ из корзины', 
    description: 'Берет все элементы из текущей корзины пользователя, применяет промокод (если передан), фиксирует цены-снимки и очищает корзину.' 
  })
  @ApiCreatedResponse({ description: 'Заказ успешно создан и отправлен на кухню.', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации или пустая корзина пользователя.' })
  @ApiResponse({ status: 404, description: 'Указанный промокод не существует или просрочен.' })
  createOrder(@Req() req: AuthenticatedRequest, @Body() body: CreateOrderDto) {
    return this.pizzaClient.send('create_order', { userId: req.user.userId, ...body });
  }

  // * Получить информацию/статус конкретного заказа по его ID (GET /orders/:id)
  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({ 
    summary: 'Получить информацию о конкретном заказе по ID', 
    description: 'Позволяет клиенту или администратору узнать текущее состояние и детали конкретного заказа.' 
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Уникальный идентификатор заказа',
    example: 105,
  })
  @ApiOkResponse({ description: 'Информация о заказе успешно получена.', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный формат ID.' })
  @ApiResponse({ status: 404, description: 'Заказ не найден.' })
  getOrder(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.pizzaClient.send('get_order_status', { userId: req.user.userId, orderId: id });
  }

  // * Изменить статус заказа по его ID (PATCH /orders/:id)
  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Изменить статус выполнения заказа', 
    description: 'Доступно только администратору. Переводит заказ на этапы: processing, delivering, completed и др.' 
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Уникальный идентификатор заказа',
    example: 105,
  })
  @ApiOkResponse({ description: 'Статус заказа успешно обновлен.', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный формат ID или некорректный статус.' })
  @ApiResponse({ status: 404, description: 'Заказ с указанным ID не найден.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (требуется роль admin).' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderStatusDto
  ) {
    return this.pizzaClient.send('admin_update_order_status', { orderId: id, status: body.status });
  }
}
