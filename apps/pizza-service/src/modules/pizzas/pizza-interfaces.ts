// * Интерфейсы обмена данными для модуля меню пицц

// 1. Параметры пагинации для получения списка пицц (GET /pizzas)
export interface PizzaPaginationPayload {
  page: number;
  limit: number;
}

// 2. Данные от шлюза для создания новой пиццы (POST /pizzas)
export interface CreatePizzaPayload {
  title: string;
  description?: string;
  price: number;
  imageUrl: string; // Шлюз сохранит файл и пришлет нам готовую текстовую строку-путь
  ingredients: number[]; // Массив числовых ID ингредиентов
}

// 3. Данные от шлюза для редактирования пиццы по ID (PUT /pizzas/:id)
export interface UpdatePizzaPayload {
  pizzaId: number;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string; // Если админ загрузил новую картинку, придет новая строка
}

// 4. Полезная нагрузка для точечной привязки одного ингредиента (POST /pizzas/:id/ingredients)
export interface AddIngredientToPizzaPayload {
  pizzaId: number;
  ingredientId: number;
}

// 5. Полезная нагрузка для удаления одного ингредиента из пиццы
export interface RemoveIngredientFromPizzaPayload {
  pizzaId: number;
  ingredientId: number;
}