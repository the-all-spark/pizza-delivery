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

  @MessagePattern('get_all_ingredients')
  async getAllIngredients() {
    return await this.ingredientService.findAll();
  }

  @MessagePattern('create_ingredient')
  async createIngredient(@Payload() data: CreateIngredientPayload) {
    return await this.ingredientService.create(data);
  }

  @MessagePattern('update_ingredient')
  async updateIngredient(@Payload() data: UpdateIngredientPayload) {
    const { id, ...updateFields } = data;
    return await this.ingredientService.update(id, updateFields);
  }

  @MessagePattern('delete_ingredient')
  async deleteIngredient(@Payload() data: { id: number }) {
    return await this.ingredientService.delete(data.id);
  }

  @MessagePattern('get_ingredient_by_id')
  async getIngredientById(@Payload() data: GetIngredientByIdPayload) {
    return await this.ingredientService.findById(data.id);
  }
}
