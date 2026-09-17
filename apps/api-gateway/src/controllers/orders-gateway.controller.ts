// Контроллер заказов

import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Body, 
  Param, 
  Inject, 
  UseFilters, 
  Req,
  ParseIntPipe
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

// Импорт DTO и интерфейса
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

  // ========================
  // МАРШРУТЫ АДМИНИСТРАТОРА 
  // ========================

  // * Просмотреть информацию о текущих заказах и их статусах (GET /orders/admin/current)
  @Get('admin/current')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Получить список всех текущих заказов в системе', 
    description: 'Доступно только администратору. Возвращает все активные заказы.' 
  })
  @ApiOkResponse({ description: 'Список заказов успешно получен.', type: [OrderResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (требуется роль admin).' })
  getAllOrders() {
    return this.pizzaClient.send('admin_get_all_orders', {});
  }

  // * Изменить статус заказа по его ID (PUT /orders/admin/:id/status-edit)
  @Put('admin/:id/status-edit')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Изменить статус выполнения заказа', 
    description: 'Доступно только администратору. Переводит заказ на этапы: processing, delivering, completed и др.' 
  })
  @ApiOkResponse({ description: 'Статус заказа успешно обновлен.', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный формат ID или некорректный статус.' })
  @ApiResponse({ status: 404, description: 'Заказ с указанным ID не найден.' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderStatusDto
  ) {
    return this.pizzaClient.send('admin_update_order_status', { orderId: id, status: body.status });
  }

  // =========================
  // ПОЛЬЗОВАТЕЛЬСКИЕ МАРШРУТЫ
  // =========================

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

  // * Получить все свои заказы и их статусы (GET /orders/my-history)
  @Get('my-history')
  @Roles('user', 'admin')
  @ApiOperation({ 
    summary: 'Получить историю собственных заказов', 
    description: 'Возвращает список всех когда-либо оформленных заказов текущего авторизованного пользователя.' 
  })
  @ApiOkResponse({ description: 'История заказов успешно получена.', type: [OrderResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  getMyOrders(@Req() req: AuthenticatedRequest) {
    return this.pizzaClient.send('get_user_orders_history', { userId: req.user.userId });
  }

  // * Получить статус собственного заказа по его id (GET /orders/:id/status)
  @Get(':id/status')
  @Roles('user', 'admin')
  @ApiOperation({ 
    summary: 'Получить детальный статус конкретного заказа по ID', 
    description: 'Позволяет клиенту узнать текущий статус сборки/доставки его личной пиццы.' 
  })
  @ApiOkResponse({ description: 'Информация о заказе успешно получена.', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный формат ID.' })
  @ApiResponse({ status: 404, description: 'Заказ не найден.' })
  getOrderStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.pizzaClient.send('get_order_status', { userId: req.user.userId, orderId: id });
  }
}
