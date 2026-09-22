// * Интерфейсы обмена данными для модуля корзины (cart)

// 1. Полезная нагрузка для просмотра корзины конкретного пользователя (GET /cart)
export interface GetCartPayload {
  userId: number;
}

// 2. Полезная нагрузка для добавления пиццы в корзину (POST /cart)
export interface AddToCartPayload {
  userId: number;
  pizzaId: number;
  quantity: number;
}

// 3. Полезная нагрузка для изменения количества пиццы по ID элемента корзины (PUT /cart/:cartItemId)
export interface UpdateCartItemPayload {
  userId: number;      // Нужен для проверки прав владения корзиной
  cartItemId: number;  // ID записи в таблице cart_items
  quantity: number;    // Новое точное количество пицц
}

// 4. Полезная нагрузка для удаления элемента из корзины (DELETE /cart/:cartItemId)
export interface RemoveFromCartPayload {
  userId: number;
  cartItemId: number;
}
