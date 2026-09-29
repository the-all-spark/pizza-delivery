// * Интерфейсы обмена данными для модуля корзины (cart)

// Полезная нагрузка для просмотра корзины конкретного пользователя (GET /cart)
export interface GetCartPayload {
  userId: number;
}

// Полезная нагрузка для добавления пиццы в корзину (POST /cart)
export interface AddToCartPayload {
  userId: number;
  pizzaId: number;
  quantity: number;
}

// Полезная нагрузка для изменения количества пиццы по ID элемента корзины (PUT /cart/:cartItemId)
export interface UpdateCartItemPayload {
  userId: number;
  cartItemId: number;
  quantity: number;
}

// Полезная нагрузка для удаления элемента из корзины (DELETE /cart/:cartItemId)
export interface RemoveFromCartPayload {
  userId: number;
  cartItemId: number;
}
