import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { OrderStatus } from '@shared/enums';

import { Order } from '../orders/order.entity';
import { OrderItem } from './order-item.entity';
import { CartItem } from '../../cart-service/src/cart-item.entity';
import { PromoCode } from '../../pizza-service/src/modules/promo-codes/promo-code.entity';
import { Pizza } from '../../pizza-service/src/pizza.entity';

import {
  CreateOrderPayload,
  GetUserOrdersPayload,
  GetOrderStatusPayload,
  AdminUpdateStatusPayload,
  AdminGetAllOrdersPayload,
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

    @InjectRepository(Pizza)
    private readonly pizzaRepository: Repository<Pizza>,

    // DataSource нужен для безопасного выполнения аналитических Raw SQL запросов
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
        message: 'Unable to place an order: your cart is empty.',
      });
    }

    // 2. Рассчитываем базовую стоимость заказа по актуальным ценам из каталога
    let basePrice = 0;
    for (const item of cartItems) {
      if (!item.pizza) {
        throw new RpcException({
          statusCode: 404,
          message: `The pizza for the cart item is no longer on the menu.`,
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
          message: 'The specified promo code does not exist, has been deactivated, or has expired.',
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

    // Массово обновляем дату (lastOrderedAt) для всех уникальных pizzaId, участвующих в заказе
    const pizzaIds = cartItems.map((item) => item.pizzaId);
    await this.pizzaRepository.update(
      { pId: In(pizzaIds) }, // Выбираем только те пиццы, которые были в корзине
      { lastOrderedAt: new Date() }, // Выставляем текущую дату заказа
    );

    // 7. Очищаем корзину пользователя — заказ успешно зафиксирован
    await this.cartItemRepository.delete({ userId: userIdNum });

    return savedOrder;
  }

  // ==========================================
  // 2. ИСТОРИЯ ЗАКАЗОВ ПОЛЬЗОВАТЕЛЯ (С ПАГИНАЦИЕЙ)
  // ==========================================
  async getUserOrdersHistory(payload: GetUserOrdersPayload): Promise<any> {
    const { page, limit } = payload;
    const skip = (page - 1) * limit;

    // findAndCount возвращает одновременно массив элементов [0] и общее число строк в БД [1]
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId: Number(payload.userId) },
      relations: {
        items: true,
      },
      order: { createdAt: 'DESC' },
      skip: skip, // Сколько строк пропустить
      take: limit, // Сколько строк забрать
    });

    // Приводим decimal-строки к числам number
    const formattedOrders = orders.map((order) => {
      order.totalPrice = Number(order.totalPrice);

      if (order.items) {
        order.items = order.items.map((item) => {
          item.priceSnapshot = Number(item.priceSnapshot);
          return item;
        });
      }
      return order;
    });

    // Возвращаем объект со стандартизированной мета-информацией пагинации
    return {
      data: formattedOrders,
      total,
      page,
      limit,
    };
  }

  // ==========================================
  // 3. ВСЕ ЗАКАЗЫ В СИСТЕМЕ (ДЛЯ АДМИНА С ПАГИНАЦИЕЙ)
  // ==========================================
  async adminGetAllOrders(payload: AdminGetAllOrdersPayload): Promise<any> {
    const { page, limit } = payload;
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      relations: {
        items: true,
      },
      order: { createdAt: 'DESC' },
      skip: skip,
      take: limit,
    });

    const formattedOrders = orders.map((order) => {
      order.totalPrice = Number(order.totalPrice);

      if (order.items) {
        order.items = order.items.map((item) => {
          item.priceSnapshot = Number(item.priceSnapshot);
          return item;
        });
      }
      return order;
    });

    return {
      data: formattedOrders,
      total,
      page,
      limit,
    };
  }

  // ==========================================
  // 4. ПОЛУЧИТЬ СТАТУС/ИНФОРМАЦИЮ КОНКРЕТНОГО ЗАКАЗА ПО ID
  // ==========================================
  async getOrderStatus(payload: GetOrderStatusPayload): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderId: payload.orderId },
      // Явно приказываем TypeORM подгрузить массив строчек чека из БД
      relations: {
        items: true,
      },
    });

    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${payload.orderId} was not found in the system.`,
      });
    }

    // Если запрашивает НЕ admin И заказ принадлежит НЕ этому пользователю
    const userIdNum = Number(payload.userId);
    if (!payload.role.includes('admin') && order.userId !== userIdNum) {
      throw new RpcException({
        statusCode: 403,
        message: `Access denied: you cannot view other people's orders.`,
      });
    }

    // Конвертируем decimal-строку "362.00" обратно в чистый number для Swagger
    order.totalPrice = Number(order.totalPrice);

    // Дополнительно страхуем decimal-цены внутри каждой пиццы в заказе
    if (order.items) {
      order.items = order.items.map((item) => {
        item.priceSnapshot = Number(item.priceSnapshot);
        return item;
      });
    }

    return order;
  }

  // ==========================================
  // 5. ИЗМЕНЕНИЕ СТАТУСА ЗАКАЗА (ДЛЯ АДМИНА)
  // ==========================================
  async adminUpdateOrderStatus(payload: AdminUpdateStatusPayload): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderId: payload.orderId },
    });

    if (!order) {
      throw new RpcException({
        statusCode: 404,
        message: `Order with ID ${payload.orderId} not found for update.`,
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
      return { message: 'No orders were found for the specified period.' };
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
    // Выполняем аналитический запрос через DataSource
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
