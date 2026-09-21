// * Интерфейсы обмена данными для модуля промокодов

// Данные для создания промокода
export interface CreatePromoCodePayload {
  code: string;
  discountPercent: number;
  expiresAt: string; // Принимаем дату в формате строки ISO от шлюза
  isActive?: boolean;
}

// Данные для обновления промокода по ID
export interface UpdatePromoCodePayload {
  promoId: number;
  code?: string;
  discountPercent?: number;
  expiresAt?: string;
  isActive?: boolean;
}
