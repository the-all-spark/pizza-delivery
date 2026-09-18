// * Контроллер корзины
// Пользователь может менять только собственную корзину, админ доступа не имеет.

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
  HttpStatus
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
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

// Импорт DTO и интерфейса запроса
import { AddToCartDto } from '../dto/cart/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/cart/update-cart-item.dto';
import { CartItemResponseDto } from '../dto/cart/cart-response.dto';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@ApiTags('Cart')
@ApiBearerAuth('bearerAuth')
@Controller('cart')
@UseFilters(RpcExceptionFilter)
@Roles('user')
export class CartGatewayController {
  constructor(
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy
  ) {}

  // * Просмотр содержимого собственной корзины (GET /cart)
  @Get()
  @ApiOperation({ 
    summary: 'Просмотр содержимого корзины', 
    description: 'Возвращает список всех пицц, добавленных текущим авторизованным пользователем.' 
  })
  @ApiOkResponse({ description: 'Содержимое корзины успешно получено.', type: [CartItemResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  getCart(@Req() req: AuthenticatedRequest) {
    return this.pizzaClient.send('get_user_cart', { userId: req.user.userId });
  }

  // * Добавить пиццу в собственную корзину (POST /cart)
  @Post()
  @ApiOperation({ 
    summary: 'Добавить пиццу в корзину', 
    description: 'Добавляет пиццу в корзину. Если пицца уже есть, увеличивает её количество.' 
  })
  @ApiCreatedResponse({ description: 'Пицца успешно добавлена в корзину.', type: CartItemResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидные входные данные.' })
  @ApiResponse({ status: 404, description: 'Указанная пицца не найдена в каталоге.' })
  addToCart(@Req() req: AuthenticatedRequest, @Body() body: AddToCartDto) {
    return this.pizzaClient.send('add_to_cart', { userId: req.user.userId, ...body });
  }

  // * Редактирование количества пиццы в собственной корзине (PUT /cart/:cartItemId)
  @Put(':cartItemId')
  @ApiOperation({ 
    summary: 'Изменить количество пиццы в корзине', 
    description: 'Позволяет изменить количество (`quantity`) конкретной позиции в корзине.' 
  })
  @ApiParam({
    name: 'cartItemId',
    type: Number,
    description: 'Уникальный идентификатор элемента корзины',
    example: 12,
  })
  @ApiOkResponse({ description: 'Количество успешно изменено.', type: CartItemResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидный ID или некорректное количество.' })
  @ApiResponse({ status: 404, description: 'Элемент корзины не найден.' })
  updateCart(
    @Req() req: AuthenticatedRequest, 
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Body() body: UpdateCartItemDto
  ) {
    return this.pizzaClient.send('update_cart_item', { 
      userId: req.user.userId, 
      cartItemId, 
      quantity: body.quantity 
    });
  }

  // * Удалить пиццу из собственной корзины (DELETE /cart/:cartItemId)
  @Delete(':cartItemId')
  @HttpCode(HttpStatus.NO_CONTENT) // Возвращаем 204 No Content
  @ApiOperation({ 
    summary: 'Удалить позицию из корзины', 
    description: 'Полностью удаляет конкретную пиццу из корзины текущего пользователя.' 
  })
  @ApiParam({
    name: 'cartItemId',
    type: Number,
    description: 'Уникальный идентификатор элемента корзины',
    example: 12,
  })
  @ApiNoContentResponse({ description: 'Позиция успешно удалена из корзины. Ничего не возвращает.' })
  @ApiResponse({ status: 400, description: 'Неверный формат ID элемента корзины.' })
  @ApiResponse({ status: 404, description: 'Элемент в корзине пользователя не найден.' })
  removeFromCart(
    @Req() req: AuthenticatedRequest, 
    @Param('cartItemId', ParseIntPipe) cartItemId: number
  ) {
    return this.pizzaClient.send('remove_from_cart', { userId: req.user.userId, cartItemId });
  }
}