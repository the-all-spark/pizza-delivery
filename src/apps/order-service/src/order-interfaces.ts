import { OrderStatus, DeliveryMethod, PaymentMethod } from '@shared/enums';

// Просмотр истории заказов (Пользователь)
export interface GetUserOrdersPayload {
  userId: string;
  page: number;
  limit: number;
}

// Структура для запроса администратора
export interface AdminGetAllOrdersPayload {
  page: number;
  limit: number;
}

// Оформление нового заказа из корзины (POST /orders)
export interface CreateOrderPayload {
  userId: string;
  address: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  comment?: string;
  promoCode?: string; // Текстовый код купона, например 'PIZZA2026'
}

// Получение статуса конкретного заказа (GET /orders/:id)
export interface GetOrderStatusPayload {
  userId: string;
  orderId: number;
  role: string; // роль, чтобы контролировать права доступа на уровне сервиса
}

// Изменение статуса заказа администратором (PATCH /orders/:id)
export interface AdminUpdateStatusPayload {
  orderId: number;
  status: OrderStatus;
}
