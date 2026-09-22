// * Контроллер корзины
// Пользователь может менять только собственную корзину, админ доступа к корзине пользователей не имеет.

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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
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
  ApiNoContentResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

// Импорт DTO и интерфейса запроса
import { AddToCartDto } from '../dto/cart/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/cart/update-cart-item.dto';
import { CartItemResponseDto } from '../dto/cart/cart-response.dto';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { ForbiddenErrorResponseDto } from '../dto/forbidden-error-response.dto';

@ApiTags('Cart')
@ApiBearerAuth('bearerAuth')
@Controller('cart')
@UseFilters(RpcExceptionFilter)
@Roles('user')
// Добавляем 403 ошибку на уровень всего контроллера, так как @Roles('user') защищает все эндпоинты
@ApiForbiddenResponse({
  description:
    'Access denied. Administrators do not have access to user carts.',
  type: ForbiddenErrorResponseDto,
})
export class CartGatewayController {
  constructor(
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy,
  ) {}

  // * Просмотр содержимого собственной корзины (GET /cart)
  @Get()
  @ApiOperation({
    summary: 'View cart content',
    description:
      'Returns a list of all pizzas added by the current authorized user.',
  })
  @ApiOkResponse({
    description: 'Cart content successfully retrieved.',
    type: [CartItemResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getCart(@Req() req: AuthenticatedRequest) {
    return this.pizzaClient.send('get_user_cart', { userId: req.user.userId });
  }

  // * Добавить пиццу в собственную корзину (POST /cart)
  @Post()
  @ApiOperation({
    summary: 'Add pizza to cart',
    description:
      'Adds a pizza to the cart. If the pizza already exists, increases its quantity.',
  })
  @ApiCreatedResponse({
    description: 'Pizza successfully added to the cart.',
    type: CartItemResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({
    status: 404,
    description: 'The specified pizza was not found in the catalog.',
  })
  addToCart(@Req() req: AuthenticatedRequest, @Body() body: AddToCartDto) {
    return this.pizzaClient.send('add_to_cart', {
      userId: req.user.userId,
      ...body,
    });
  }

  // * Редактирование количества пиццы в собственной корзине (PUT /cart/:cartItemId)
  @Put(':cartItemId')
  @ApiOperation({
    summary: 'Change pizza quantity in cart',
    description: 'Allows changing the quantity of a specific item in the cart.',
  })
  @ApiParam({
    name: 'cartItemId',
    type: Number,
    description: 'Unique cart item identifier',
    example: 12,
  })
  @ApiOkResponse({
    description: 'Quantity successfully changed.',
    type: CartItemResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID or incorrect quantity.',
  })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  updateCart(
    @Req() req: AuthenticatedRequest,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.pizzaClient.send('update_cart_item', {
      userId: req.user.userId,
      cartItemId,
      quantity: body.quantity,
    });
  }

  // * Удалить пиццу из собственной корзины (DELETE /cart/:cartItemId)
  @Delete(':cartItemId')
  @HttpCode(HttpStatus.NO_CONTENT) // Возвращаем 204 No Content
  @ApiOperation({
    summary: 'Remove item from cart',
    description:
      'Completely removes a specific pizza from the cart of the current user.',
  })
  @ApiParam({
    name: 'cartItemId',
    type: Number,
    description: 'Unique cart item identifier',
    example: 12,
  })
  @ApiNoContentResponse({
    description: 'Item successfully removed from the cart. Returns no content.',
  })
  @ApiResponse({ status: 400, description: 'Invalid cart item ID format.' })
  @ApiResponse({ status: 404, description: 'Item in the user cart not found.' })
  removeFromCart(
    @Req() req: AuthenticatedRequest,
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
  ) {
    return this.pizzaClient.send('remove_from_cart', {
      userId: req.user.userId,
      cartItemId,
    });
  }
}
