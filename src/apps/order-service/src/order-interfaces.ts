import { OrderStatus, DeliveryMethod, PaymentMethod } from '@shared/enums';

export interface GetUserOrdersPayload {
  userId: string;
  page: number;
  limit: number;
}

export interface AdminGetAllOrdersPayload {
  page: number;
  limit: number;
}

export interface CreateOrderPayload {
  userId: string;
  address: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  comment?: string;
  promoCode?: string;
}

export interface GetOrderStatusPayload {
  userId: string;
  orderId: number;
  role: string;
}

export interface AdminUpdateStatusPayload {
  orderId: number;
  status: OrderStatus;
}
