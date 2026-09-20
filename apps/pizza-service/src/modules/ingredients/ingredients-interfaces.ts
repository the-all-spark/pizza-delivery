// * Интерфейсы обмена данными для модуля ингредиентов

// Полезная нагрузка для создания нового ингредиента
export interface CreateIngredientPayload {
  name: string;
  price: number;
}

// Полезная нагрузка для обновления существующего ингредиента
export interface UpdateIngredientPayload {
  id: number;
  name: string;
  price: number;
}
