// * Контроллер очередей микросервиса ингредиентов пиццы

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { IngredientService } from './ingredient.service';
import type {
  CreateIngredientPayload,
  UpdateIngredientPayload,
  GetIngredientByIdPayload,
} from './ingredient-interfaces';

@Controller()
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  // * Получить все ингредиенты пиццы
  @MessagePattern('get_all_ingredients')
  async getAllIngredients() {
    return await this.ingredientService.findAll();
  }

  // * Добавить новый ингредиент пиццы
  @MessagePattern('create_ingredient')
  async createIngredient(@Payload() data: CreateIngredientPayload) {
    return await this.ingredientService.create(data);
  }

  // * Изменить ингредиент пиццы по его id
  @MessagePattern('update_ingredient')
  async updateIngredient(@Payload() data: UpdateIngredientPayload) {
    const { id, ...updateFields } = data;
    return await this.ingredientService.update(id, updateFields);
  }

  // * Удалить ингредиент пиццы по его id
  @MessagePattern('delete_ingredient')
  async deleteIngredient(@Payload() data: { id: number }) {
    return await this.ingredientService.delete(data.id);
  }

  // * Получить ингредиент по его id
  @MessagePattern('get_ingredient_by_id')
  async getIngredientById(@Payload() data: GetIngredientByIdPayload) {
    return await this.ingredientService.findById(data.id);
  }
}
