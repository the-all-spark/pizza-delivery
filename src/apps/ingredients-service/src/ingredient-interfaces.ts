// * Интерфейсы обмена данными для модуля ингредиентов

export interface CreateIngredientPayload {
  name: string;
  price: number;
}

export interface UpdateIngredientPayload {
  id: number;
  name: string;
  price: number;
}

export interface GetIngredientByIdPayload {
  id: number;
}
