// * Интерфейсы обмена данными для модуля меню пицц

// Параметры пагинации для получения списка пицц (GET /pizzas)
export interface PizzaPaginationPayload {
  page: number;
  limit: number;
}

// Данные от шлюза для создания новой пиццы (POST /pizzas)
export interface CreatePizzaPayload {
  title: string;
  description?: string;
  price: number;
  imageUrl: string;
  ingredients: number[];
}

// Данные от шлюза для редактирования пиццы по ID (PUT /pizzas/:id)
export interface UpdatePizzaPayload {
  pizzaId: number;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

// Полезная нагрузка для точечной привязки одного ингредиента (POST /pizzas/:id/ingredients)
export interface AddIngredientToPizzaPayload {
  pizzaId: number;
  ingredientId: number;
}

// Полезная нагрузка для удаления одного ингредиента из пиццы
export interface RemoveIngredientFromPizzaPayload {
  pizzaId: number;
  ingredientId: number;
}
