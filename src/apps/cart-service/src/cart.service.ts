import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

import { CartItem } from './cart-item.entity';
import { Pizza } from '../../pizza-service/src/pizza.entity';

import {
  GetCartPayload,
  AddToCartPayload,
  UpdateCartItemPayload,
  RemoveFromCartPayload,
} from './cart-interfaces';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Pizza)
    private readonly pizzaRepository: Repository<Pizza>,
  ) {}

  // ==========================================
  // 1. ПРОСМОТР СОДЕРЖИМОГО СОБСТВЕННОЙ КОРЗИНЫ
  // ==========================================
  async getCart(payload: GetCartPayload): Promise<CartItem[]> {
    const { userId } = payload;

    return await this.cartItemRepository.find({
      where: { userId },
      relations: {
        pizza: true,
      },
      order: { cartId: 'ASC' },
    });
  }

  // ==========================================
  // 2. ДОБАВИТЬ ПИЦЦУ В КОРЗИНУ
  // ==========================================
  async addToCart(payload: AddToCartPayload): Promise<CartItem> {
    const { userId, pizzaId, quantity } = payload;

    const pizzaExists = await this.pizzaRepository.findOne({
      where: { pId: pizzaId },
    });
    if (!pizzaExists) {
      throw new RpcException({
        statusCode: 404,
        message: `Pizza with ID ${pizzaId} was not found in the menu catalog.`,
      });
    }

    const existingItem = await this.cartItemRepository.findOne({
      where: { userId, pizzaId },
    });

    if (existingItem) {
      // Если пицца уже добавлена — просто суммируем количество
      existingItem.quantity += quantity;
      return await this.cartItemRepository.save(existingItem);
    }

    const newCartItem = this.cartItemRepository.create({
      userId,
      pizzaId,
      quantity,
    });

    return await this.cartItemRepository.save(newCartItem);
  }

  // ==========================================
  // 3. ИЗМЕНИТЬ КОЛИЧЕСТВО ПИЦЦЫ В КОРЗИНЕ
  // ==========================================
  async updateCartItem(payload: UpdateCartItemPayload): Promise<CartItem> {
    const { userId, cartItemId, quantity } = payload;

    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cartItemId, userId },
    });

    if (!cartItem) {
      throw new RpcException({
        statusCode: 404,
        message: `The cart item with ID ${cartItemId} was not found for the current user.`,
      });
    }

    cartItem.quantity = quantity;
    return await this.cartItemRepository.save(cartItem);
  }

  // ==========================================
  // 4. УДАЛИТЬ ПОЗИЦИЮ ИЗ КОРЗИНЫ
  // ==========================================
  async removeFromCart(payload: RemoveFromCartPayload): Promise<{ success: boolean }> {
    const { userId, cartItemId } = payload;

    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cartItemId, userId },
    });

    if (!cartItem) {
      throw new RpcException({
        statusCode: 404,
        message: `The cart item with ID ${cartItemId} was not found for the current user.`,
      });
    }

    await this.cartItemRepository.delete(cartItemId);
    return { success: true };
  }
}
