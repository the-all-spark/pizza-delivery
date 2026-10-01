// * Интерфейсы обмена данными для модуля меню пицц

export interface PizzaPaginationPayload {
  page: number;
  limit: number;
}

export interface CreatePizzaPayload {
  title: string;
  description?: string;
  price: number;
  imageUrl: string;
  ingredients: number[];
}

export interface UpdatePizzaPayload {
  pizzaId: number;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

export interface AddIngredientToPizzaPayload {
  pizzaId: number;
  ingredientId: number;
}

export interface RemoveIngredientFromPizzaPayload {
  pizzaId: number;
  ingredientId: number;
}
