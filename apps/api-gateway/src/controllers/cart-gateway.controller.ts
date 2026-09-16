// Контроллер корзины

import { Controller, Post, Get, Put, Delete, Body, Param, Inject, UseFilters, Req, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

@ApiTags('Cart') // тег
@ApiBearerAuth('bearerAuth') 
@Controller('cart')
@UseFilters(RpcExceptionFilter)
export class CartGatewayController {
  constructor(@Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy) {}

  @Get()
  @Roles('user', 'admin')
  getCart(@Req() req: any) {
    return this.pizzaClient.send('get_user_cart', { userId: req.user.userId });
  }

  @Post()
  @Roles('user', 'admin')
  addToCart(@Req() req: any, @Body() body: any) {
    // Прикрепляем userId из токена к телу запроса, чтобы микросервис знал, чья это корзина
    return this.pizzaClient.send('add_to_cart', { userId: req.user.userId, ...body });
  }

  @Put(':cartItemId')
  @Roles('user', 'admin')
  updateCart(@Req() req: any, @Param('cartItemId') cartItemId: number, @Body() body: any) {
    return this.pizzaClient.send('update_cart_item', { userId: req.user.userId, cartItemId, ...body });
  }

  @Delete(':cartItemId')
  @Roles('user', 'admin')
  removeFromCart(@Req() req: any, @Param('cartItemId') cartItemId: number) {
    return this.pizzaClient.send('remove_from_cart', { userId: req.user.userId, cartItemId });
  }
}