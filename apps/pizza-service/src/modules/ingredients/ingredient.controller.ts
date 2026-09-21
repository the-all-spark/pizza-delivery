// * Контроллер очередей микросервиса ингредиентов пиццы
// Работает исключительно через сообщения RabbitMQ

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { IngredientService } from './ingredient.service';
import type {
  CreateIngredientPayload,
  UpdateIngredientPayload,
  GetIngredientByIdPayload
} from './ingredients-interfaces';

@Controller()
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  // * 1. Получить все ингредиенты пиццы
  // Слушает команду 'get_all_ingredients' от API Gateway
  @MessagePattern('get_all_ingredients')
  async getAllIngredients() {
    return await this.ingredientService.findAll();
  }

  // * 2. Добавить новый ингредиент пиццы
  // Слушает команду 'create_ingredient' от API Gateway
  @MessagePattern('create_ingredient')
  async createIngredient(@Payload() data: CreateIngredientPayload) {
    return await this.ingredientService.create(data);
  }

  // * 3. Изменить ингредиент пиццы по его id
  // Слушает команду 'update_ingredient' от API Gateway
  @MessagePattern('update_ingredient')
  async updateIngredient(@Payload() data: UpdateIngredientPayload) {
    const { id, ...updateFields } = data;
    return await this.ingredientService.update(id, updateFields);
  }

  // * 4. Удалить ингредиент пиццы по его id
  // Слушает команду 'delete_ingredient' от API Gateway
  @MessagePattern('delete_ingredient')
  async deleteIngredient(@Payload() data: { id: number }) {
    return await this.ingredientService.delete(data.id);
  }

  // * 5. Получить ингредиент по его id
  // Слушает команду 'get_ingredient_by_id' от API Gateway
  @MessagePattern('get_ingredient_by_id')
  async getIngredientById(@Payload() data: GetIngredientByIdPayload) {
    return await this.ingredientService.findById(data.id);
  }
}
