// * Юнит-тесты на Jest для CartService

import { describe, beforeEach, it, expect, jest } from '@jest/globals';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

import { CartService } from '../cart.service';
import { CartItem } from '../cart-item.entity';
import { Pizza } from '../../../pizza-service/src/pizza.entity';

describe('CartService', () => {
  let service: CartService;
  let cartItemRepo: Repository<CartItem>;
  let pizzaRepo: Repository<Pizza>;

  // Заменяем реальные методы базы данных заглушками
  const mockRepositoryFactory = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  });

  // Настройка тестового модуля
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        // Внедряем мок-репозитории вместо реальный TypeORM репозиторией
        {
          provide: getRepositoryToken(CartItem),
          useFactory: mockRepositoryFactory,
        },
        {
          provide: getRepositoryToken(Pizza),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    // Извлекаем экземпляры сервиса и моков для использования в тестах
    service = module.get<CartService>(CartService);
    cartItemRepo = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    pizzaRepo = module.get<Repository<Pizza>>(getRepositoryToken(Pizza));
  });

  // ==========================================
  // ТЕСТЫ ДЛЯ МЕТОДА: ПОЛУЧЕНИЕ КОРЗИНЫ (getCart)
  // ==========================================
  describe('getCart', () => {
    it('должен успешно вернуть список элементов корзины пользователя', async () => {
      const mockCartItems = [{ cartId: 1, userId: 1, pizzaId: 10, quantity: 2 }];
      // при вызове find() вернуть наш заготовленный массив
      jest.spyOn(cartItemRepo, 'find').mockResolvedValue(mockCartItems as any);

      const result = await service.getCart({ userId: 1 });

      expect(result).toEqual(mockCartItems);
      expect(cartItemRepo.find).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // ТЕСТЫ ДЛЯ МЕТОДА: ДОБАВИТЬ В КОРЗИНУ (addToCart)
  // ==========================================
  describe('addToCart', () => {
    it('должен выбросить 404 ошибку, если добавляемой пиццы нет в меню', async () => {
      // пицца не найдена (вернулся null)
      jest.spyOn(pizzaRepo, 'findOne').mockResolvedValue(null);

      // проверяем, что вызов сервиса падает с ошибкой RpcException (404)
      await expect(service.addToCart({ userId: 1, pizzaId: 999, quantity: 1 })).rejects.toThrow(
        RpcException,
      );
    });

    it('должен увеличить количество (quantity++), если пицца уже лежит в корзине', async () => {
      const existingCartItem = { cartId: 1, userId: 1, pizzaId: 10, quantity: 2 };

      jest.spyOn(pizzaRepo, 'findOne').mockResolvedValue({ pId: 10 } as any); 
      jest.spyOn(cartItemRepo, 'findOne').mockResolvedValue(existingCartItem as any); 
      jest.spyOn(cartItemRepo, 'save').mockImplementation(async (item) => item as any);

      const result = await service.addToCart({ userId: 1, pizzaId: 10, quantity: 3 });

      expect(result.quantity).toEqual(5); 
      expect(cartItemRepo.save).toHaveBeenCalledWith(existingCartItem);
    });

    it('должен создать новую позицию, если этой пиццы еще нет в корзине', async () => {
      const newCartItem = { userId: 1, pizzaId: 10, quantity: 1 };

      jest.spyOn(pizzaRepo, 'findOne').mockResolvedValue({ pId: 10 } as any);
      jest.spyOn(cartItemRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(cartItemRepo, 'create').mockReturnValue(newCartItem as any);
      jest.spyOn(cartItemRepo, 'save').mockResolvedValue({ cartId: 2, ...newCartItem } as any);

      const result = await service.addToCart({ userId: 1, pizzaId: 10, quantity: 1 });

      expect(result.cartId).toEqual(2);
      expect(cartItemRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // ТЕСТЫ ДЛЯ МЕТОДА: ИЗМЕНИТЬ КОЛИЧЕСТВО (updateCartItem)
  // ==========================================
  describe('updateCartItem', () => {
    it('должен выбросить 404 ошибку, если элемент корзины не найден или чужой', async () => {
      jest.spyOn(cartItemRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateCartItem({ userId: 1, cartItemId: 55, quantity: 5 }),
      ).rejects.toThrow(RpcException);
    });

    it('должен успешно изменить количество существующего элемента корзины', async () => {
      const existingItem = { cartId: 5, userId: 1, pizzaId: 10, quantity: 1 };

      jest.spyOn(cartItemRepo, 'findOne').mockResolvedValue(existingItem as any);
      jest.spyOn(cartItemRepo, 'save').mockImplementation(async (item) => item as any);

      const result = await service.updateCartItem({ userId: 1, cartItemId: 5, quantity: 10 });

      expect(result.quantity).toEqual(10);
    });
  });

  // ==========================================
  // ТЕСТЫ ДЛЯ МЕТОДА: УДАЛИТЬ ИЗ КОРЗИНЫ (removeFromCart)
  // ==========================================
  describe('removeFromCart', () => {
    it('должен выбросить 404, если пользователь пытается удалить не существующий или чужой элемент', async () => {
      jest.spyOn(cartItemRepo, 'findOne').mockResolvedValue(null);

      await expect(service.removeFromCart({ userId: 1, cartItemId: 99 })).rejects.toThrow(
        RpcException,
      );
    });

    it('должен успешно вызвать метод физического удаления из базы данных', async () => {
      const existingItem = { cartId: 12, userId: 1, pizzaId: 10, quantity: 1 };

      jest.spyOn(cartItemRepo, 'findOne').mockResolvedValue(existingItem as any);
      jest.spyOn(cartItemRepo, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.removeFromCart({ userId: 1, cartItemId: 12 });

      expect(result).toEqual({ success: true });
      expect(cartItemRepo.delete).toHaveBeenCalledWith(12);
    });
  });
});
