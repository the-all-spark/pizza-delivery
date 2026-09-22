import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { OrderStatus } from '@shared/enums';

import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartItem } from '../cart/cart-item.entity';
import { PromoCode } from '../promo-codes/promo-code.entity';

import {
  CreateOrderPayload,
  GetUserOrdersPayload,
  GetOrderStatusPayload,
  AdminUpdateStatusPayload,
} from './orders-interfaces';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,

    // DataSource нужен нам для безопасного выполнения аналитических Raw SQL запросов
    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // 1. ОФОРМЛЕНИЕ ЗАКАЗА ИЗ КОРЗИНЫ
  // ==========================================
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const userIdNum = Number(payload.userId);

    // 1. Выкачиваем текущую корзину пользователя со всеми данными о пиццах
    const cartItems = await this.cartItemRepository.find({
      where: { userId: userIdNum },
      relations: { pizza: true },
    });

    if (!cartItems || cartItems.length === 0) {
      throw new RpcException({
        statusCode: 400,
        message: 'Невозможно оформить заказ: ваша корзина пуста.',
      });
    }

    // 2. Рассчитываем базовую стоимость заказа по актуальным ценам из каталога
    let basePrice = 0;
    for (const item of cartItems) {
      if (!item.pizza) {
        throw new RpcException({
          statusCode: 404,
          message: `Пицца для позиции корзины больше не существует в меню.`,
        });
      }
      basePrice += Number(item.pizza.price) * item.quantity;
    }

    // 3. Проверяем и применяем промокод, если он был передан
    let appliedPromo: PromoCode | null = null;
    let discountPercent = 0;

    if (payload.promoCode) {
      appliedPromo = await this.promoCodeRepository.findOne({
        where: { code: payload.promoCode, isActive: true },
      });

      // Проверяем существование купона и его срок годности
      if (!appliedPromo || new Date() > new Date(appliedPromo.expiresAt)) {
        throw new RpcException({
          statusCode: 404,
          message:
            'Указанный промокод не существует, деактивирован или просрочен.',
        });
      }
      discountPercent = appliedPromo.discountPercent;
    }

    // 4. Вычисляем финальную стоимость с учетом скидки
    const finalPrice = basePrice * (1 - discountPercent / 100);

    // 5. Создаем «шапку» заказа
    const newOrder = this.orderRepository.create({
      userId: userIdNum,
      address: payload.address,
      deliveryMethod: payload.deliveryMethod,
      paymentMethod: payload.paymentMethod,
      comment: payload.comment || null,
      totalPrice: Number(finalPrice.toFixed(2)),
      promoCodeId: appliedPromo ? appliedPromo.promoId : null,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    // 6. Формируем строчки чека (снимки цен и названий)
    const orderItemsToSave = cartItems.map((cartItem) => {
      return this.orderItemRepository.create({
        orderId: savedOrder.orderId,
        pizzaItemId: cartItem.pizzaId,
        titleSnapshot: cartItem.pizza.title,
        priceSnapshot: Number(cartItem.pizza.price),
        quantity: cartItem.quantity,
      });
    });

    await this.orderItemRepository.save(orderItemsToSave);

    // 7. Очищаем корзину пользователя — заказ успешно зафиксирован
    await this.cartItemRepository.delete({ userId: userIdNum });

    return savedOrder;
  }

  // ==========================================
  // 2. ИСТОРИЯ ЗАКАЗОВ ПОЛЬЗОВАТЕЛЯ
  // ==========================================
  async getUserOrdersHistory(payload: GetUserOrdersPayload): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { userId: Number(payload.userId) },
      order: { createdAt: 'DESC' }, // Сначала самые свежие заказы
    });
  }

  // ==========================================
  // 3. ВСЕ ЗАКАЗЫ В СИСТЕМЕ (ДЛЯ АДМИНА)
  // ==========================================
  async adminGetAllOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // ==========================================
  // 4. ПОЛУЧИТЬ СТАТУС КОНКРЕТНОГО ЗАКАЗА
  // ==========================================
  async getOrderStatus(payload: GetOrderStatusPayload): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderId: payload.orderId },
    });

    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Заказ с ID ${payload.orderId} не найден в системе.`,
      });
    }

    // Если запрашивает НЕ админ И заказ принадлежит НЕ этому пользователю
    const userIdNum = Number(payload.userId);
    if (!payload.role.includes('admin') && order.userId !== userIdNum) {
      throw new RpcException({
        statusCode: 403,
        message: 'Доступ запрещен: вы не можете просматривать чужие заказы.',
      });
    }

    return order;
  }

  // ==========================================
  // 5. ИЗМЕНЕНИЕ СТАТУСА ЗАКАЗА (ДЛЯ АДМИНА)
  // ==========================================
  async adminUpdateOrderStatus(
    payload: AdminUpdateStatusPayload,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderId: payload.orderId },
    });

    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Заказ с ID ${payload.orderId} не найден для обновления.`,
      });
    }

    order.status = payload.status;
    return await this.orderRepository.save(order);
  }

  // ==========================================
  // 6. АНАЛИТИКА 1: САМАЯ ПОПУЛЯРНАЯ ПИЦЦА МЕСЯЦА (RAW SQL)
  // ==========================================

  /**
   * Найти пиццу, которая за выбранный месяц и год чаще всего фигурировала в уже оформленных заказах,
   * и посчитать суммарное проданное количество.
   */

  async getMostPopularPizzaOfMonth(month: number, year: number): Promise<any> {
    // Выполняем чистый SQL через подключенный DataSource
    const result = await this.dataSource.query(
      `
      SELECT 
        oi.pizza_item_id AS "pizzaId", 
        oi.title_snapshot AS "title", 
        SUM(oi.quantity)::int AS "totalQuantity"
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.order_id
      WHERE 
        EXTRACT(MONTH FROM o.created_at) = $1
        AND EXTRACT(YEAR FROM o.created_at) = $2
      GROUP BY oi.pizza_item_id, oi.title_snapshot
      ORDER BY "totalQuantity" DESC
      LIMIT 1;
      `,
      [month, year], // Передаем параметры безопасно (защита от SQL-инъекций)
    );

    // Если за этот месяц вообще не было заказов, возвращаем понятное сообщение
    if (!result || result.length === 0) {
      return { message: 'За указанный период заказов не обнаружено.' };
    }

    // Возвращаем первую (и единственную благодаря LIMIT 1) строку результата
    return result[0];
  }

  // ==========================================
  // 7. АНАЛИТИКА 2: ПОЛЬЗОВАТЕЛИ С ВЫСОКИМ СРЕДНИМ ЧЕКОМ (RAW SQL)
  // ==========================================

  /**
   * Найти пользователей, у которых:
   * - Оформлено не менее 3 заказов (то есть COUNT(order_id) >= 3).
   * - Личный средний чек выше или равен среднему значению среднего чека по всем
   * пользователям в системе.
   */

  async getPremiumUsersWithHighAverageCheck(): Promise<any[]> {
    // Выполняем сложный аналитический запрос через DataSource
    const results = await this.dataSource.query(
      `
      WITH user_averages AS (
        -- Считаем средний чек и количество заказов для каждого пользователя отдельно
        SELECT 
          user_id AS "userId",
          AVG(total_price) AS "userAvgCheck",
          COUNT(order_id) AS "ordersCount"
        FROM orders
        WHERE user_id IS NOT NULL
        GROUP BY user_id
      )
      -- Фильтруем пользователей по условиям задачи
      SELECT 
        "userId",
        ROUND("userAvgCheck", 2)::float AS "averageCheck",
        "ordersCount"
      FROM user_averages
      WHERE 
        "ordersCount" >= 3
        AND "userAvgCheck" >= (SELECT AVG("userAvgCheck") FROM user_averages)
      ORDER BY "averageCheck" DESC;
      `,
    );

    return results;
  }
}
