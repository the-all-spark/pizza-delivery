export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum DeliveryMethod {
  COURIER = 'courier',
  PICKUP = 'pickup',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD_ONLINE = 'card_online',
  CARD_COURIER = 'card_courier',
}