export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const DeliveryMethod = {
  COURIER: 'courier',
  PICKUP: 'pickup',
} as const;

export const PaymentMethod = {
  CASH: 'cash',
  CARD_ONLINE: 'card_online',
  CARD_COURIER: 'card_courier',
} as const;

// Генерируем типы TypeScript для статической проверки
export type UserRole = typeof UserRole[keyof typeof UserRole];
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
export type DeliveryMethod = typeof DeliveryMethod[keyof typeof DeliveryMethod];
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
