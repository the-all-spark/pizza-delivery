// * Контроллер Шлюза (Прием и маршрутизация по ТЗ)

/**
 *  Контроллер шлюза описывает HTTP-эндпоинты и распределяет права доступа
 * с помощью декораторов @Public() и @Roles().
 * Для отправки запросов в RabbitMQ используется метод this.client.send(pattern, payload).
 * Он возвращает Observable, который NestJS автоматически превращает в HTTP-ответ
 * после получения данных от микросервиса.
 */

//!
// import { Controller, Get } from '@nestjs/common';
// import { ApiGatewayService } from './api-gateway.service';

// @Controller()
// export class ApiGatewayController {
//   constructor(private readonly apiGatewayService: ApiGatewayService) {}

//   @Get()
//   getHello(): string {
//     return this.apiGatewayService.getHello();
//   }
// }

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  UseFilters,
  Req,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
// import { lastValueFrom } from 'rxjs';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { RpcExceptionFilter } from './rpc-exception.filter';

@Controller()
@UseFilters(RpcExceptionFilter) // Применяем наш фильтр ошибок к контроллеру
export class ApiGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy,
  ) {}

  // ==========================================
  // МОДУЛЬ АВТОРИЗАЦИИ И ПОЛЬЗОВАТЕЛЕЙ (auth-service)
  // ==========================================

  @Public() // Маршрут открыт для всех
  @Post('auth/register')
  register(@Body() body: any) {
    // Отправляем команду в auth_queue и ждем результат
    return this.authClient.send('user_register', body);
  }

  @Public() // Маршрут открыт для всех
  @Post('auth/login')
  login(@Body() body: any) {
    return this.authClient.send('user_login', body);
  }

  @Delete('users/profile')
  @Roles('user', 'admin') // Доступно авторизованным ролям
  deleteAccount(@Req() req: any) {
    // Передаем ID пользователя, который мы извлекли из JWT-токена в Гварде
    return this.authClient.send('user_delete_account', {
      userId: req.user.userId,
    });
  }

  @Get('admin/users')
  @Roles('admin') // СТРОГО ОГРАНИЧЕНИЕ ТЗ: Только для администраторов
  getAllUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.authClient.send('admin_get_users', { page, limit });
  }

  // ==========================================
  // МОДУЛЬ ПИЦЦЕРИИ И КОРЗИНЫ (pizza-service)
  // ==========================================

  @Get('pizzas')
  @Roles('user', 'admin')
  getPizzas(@Query('page') page: number, @Query('limit') limit: number) {
    // Запрос списка пицц с пагинацией (Часть 2 ТЗ)
    return this.pizzaClient.send('get_pizzas_list', { page, limit });
  }

  @Get('pizzas/:id')
  @Roles('user', 'admin')
  getPizzaDetail(@Param('id') id: number) {
    return this.pizzaClient.send('get_pizza_detail', { pizzaId: id });
  }

  @Post('admin/pizzas')
  @Roles('admin') // ТЗ: Добавление пицц доступно только админу
  createPizza(@Body() body: any) {
    return this.pizzaClient.send('admin_create_pizza', body);
  }

  // ---- Управление корзиной ----
  @Get('cart')
  @Roles('user', 'admin')
  getCart(@Req() req: any) {
    return this.pizzaClient.send('get_user_cart', { userId: req.user.userId });
  }

  @Post('cart')
  @Roles('user', 'admin')
  addToCart(@Req() req: any, @Body() body: any) {
    // Прикрепляем userId из токена к телу запроса, чтобы микросервис знал, чья это корзина
    return this.pizzaClient.send('add_to_cart', {
      userId: req.user.userId,
      ...body,
    });
  }

  @Put('cart/:cartItemId')
  @Roles('user', 'admin')
  updateCart(
    @Req() req: any,
    @Param('cartItemId') cartItemId: number,
    @Body() body: any,
  ) {
    return this.pizzaClient.send('update_cart_item', {
      userId: req.user.userId,
      cartItemId,
      ...body,
    });
  }

  @Delete('cart/:cartItemId')
  @Roles('user', 'admin')
  removeFromCart(@Req() req: any, @Param('cartItemId') cartItemId: number) {
    return this.pizzaClient.send('remove_from_cart', {
      userId: req.user.userId,
      cartItemId,
    });
  }

  // ---- Заказы ----
  @Post('orders')
  @Roles('user', 'admin')
  createOrder(@Req() req: any, @Body() body: any) {
    return this.pizzaClient.send('create_order', {
      userId: req.user.userId,
      ...body,
    });
  }
}
