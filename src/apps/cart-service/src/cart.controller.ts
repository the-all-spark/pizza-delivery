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

  //* Получение корзины конкретного пользователя
  @MessagePattern('get_user_cart')
  async getUserCart(@Payload() data: { userId: string }) {
    return this.cartService.getCart({ userId: Number(data.userId) });
  }

  // * Добавление пиццы в корзину пользователя
  @MessagePattern('add_to_cart')
  async addToCart(@Payload() payload: AddToCartPayload) {
    return this.cartService.addToCart(payload);
  }

  // * Обновление количества конкретной позиции в корзине
  @MessagePattern('update_cart_item')
  async updateCartItem(@Payload() payload: UpdateCartItemPayload) {
    return this.cartService.updateCartItem(payload);
  }

  // * Удаление позиции из корзины (или полная очистка корзины)
  @MessagePattern('remove_from_cart')
  async removeFromCart(@Payload() payload: RemoveFromCartPayload) {
    return this.cartService.removeFromCart(payload);
  }
}
