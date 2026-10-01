// * Интерфейсы обмена данными для модуля корзины (cart)

export interface GetCartPayload {
  userId: number;
}

export interface AddToCartPayload {
  userId: number;
  pizzaId: number;
  quantity: number;
}

export interface UpdateCartItemPayload {
  userId: number;
  cartItemId: number;
  quantity: number;
}

export interface RemoveFromCartPayload {
  userId: number;
  cartItemId: number;
}
