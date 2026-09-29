// * Интерфейсы обмена данными для модуля промокодов

export interface CreatePromoCodePayload {
  code: string;
  discountPercent: number;
  expiresAt: string;
  isActive?: boolean;
}

export interface UpdatePromoCodePayload {
  promoId: number;
  code?: string;
  discountPercent?: number;
  expiresAt?: string;
  isActive?: boolean;
}
