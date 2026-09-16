// Контроллер заказов

import { Controller, Post, Get, Put, Delete, Body, Param, Inject, UseFilters, Req, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

@ApiTags('Orders') // ТЕГ КЛАССА ЗАКАЗОВ
@ApiBearerAuth('bearerAuth')
@Controller('orders')
@UseFilters(RpcExceptionFilter)
export class OrdersGatewayController {
  constructor(@Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy) {}

  @Post()
  @Roles('user', 'admin')
  createOrder(@Req() req: any, @Body() body: any) {
    return this.pizzaClient.send('create_order', { userId: req.user.userId, ...body });
  }
}