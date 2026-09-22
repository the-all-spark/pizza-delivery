/**
 * контроллер слушает очереди RabbitMQ через микросервисный транспорт NestJS, 
 * принимает Payload от шлюза (api-gateway), вызывает соответствующие методы CartService 
 * и возвращает ответ
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';
import type {
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
} from './cart-interfaces';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Получение корзины конкретного пользователя
   * Маршрут сообщения: 'get_user_cart'
   */
  @MessagePattern('get_user_cart')
  async getUserCart(@Payload() data: { userId: string }) {
    // Принудительно конвертируем string в number, чтобы удовлетворить GetCartPayload
    return this.cartService.getCart({ userId: Number(data.userId) });
  }

  /**
   * Добавление пиццы в корзину пользователя
   * Маршрут сообщения: 'add_to_cart'
   */
  @MessagePattern('add_to_cart')
  async addToCart(@Payload() payload: AddToCartPayload) {
    return this.cartService.addToCart(payload);
  }

  /**
   * Обновление количества конкретной позиции в корзине
   * Маршрут сообщения: 'update_cart_item'
   */
  @MessagePattern('update_cart_item')
  async updateCartItem(@Payload() payload: UpdateCartItemPayload) {
    return this.cartService.updateCartItem(payload);
  }

  /**
   * Удаление позиции из корзины (или полная очистка корзины)
   * Маршрут сообщения: 'remove_from_cart'
   */
  @MessagePattern('remove_from_cart')
  async removeFromCart(@Payload() payload: RemoveFromCartPayload) {
    return this.cartService.removeFromCart(payload);
  }
}
