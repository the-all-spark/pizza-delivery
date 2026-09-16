// Контроллер меню пицц

import { Controller, Post, Get, Put, Delete, Body, Param, Inject, UseFilters, Req, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

@ApiTags('Pizzas') // ТЕГ КЛАССА МЕНЮ
@ApiBearerAuth('bearerAuth')
@Controller()
@UseFilters(RpcExceptionFilter)
export class PizzasGatewayController {
  constructor(@Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy) {}

  @Get('pizzas')
  @Roles('user', 'admin')
  getPizzas(@Query('page') page: number, @Query('limit') limit: number) {
    return this.pizzaClient.send('get_pizzas_list', { page, limit });
  }

  @Get('pizzas/:id')
  @Roles('user', 'admin')
  getPizzaDetail(@Param('id') id: number) {
    return this.pizzaClient.send('get_pizza_detail', { pizzaId: id });
  }

  @Post('admin/pizzas')
  @Roles('admin')
  createPizza(@Body() body: any) {
    return this.pizzaClient.send('admin_create_pizza', body);
  }
}