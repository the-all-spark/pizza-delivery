// * Контроллер очередей микросервиса меню пицц (работает через сообщения RabbitMQ)

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PizzaService } from './pizza.service';

import type {
  PizzaPaginationPayload,
  CreatePizzaPayload,
  UpdatePizzaPayload,
  AddIngredientToPizzaPayload,
  RemoveIngredientFromPizzaPayload,
} from './pizza-interfaces';

@Controller()
export class PizzaController {
  constructor(private readonly pizzaService: PizzaService) {}

  // * Получить постраничный список всех пицц
  // Слушает команду 'get_pizzas_list' от API Gateway
  @MessagePattern('get_pizzas_list')
  async getPizzasList(@Payload() data: PizzaPaginationPayload) {
    return await this.pizzaService.findPaginated(data);
  }

  // * Получить детальную информацию о пицце по ID с ингредиентами
  @MessagePattern('get_pizza_detail')
  async getPizzaDetail(@Payload() data: { pizzaId: number }) {
    return await this.pizzaService.findDetailById(data.pizzaId);
  }

  // * Создать новую пиццу в меню (для админа)
  @MessagePattern('admin_create_pizza')
  async createPizza(@Payload() data: CreatePizzaPayload) {
    return await this.pizzaService.create(data);
  }

  // * Редактировать параметры пиццы по ее ID (для админа)
  @MessagePattern('admin_edit_pizza')
  async editPizza(@Payload() data: UpdatePizzaPayload) {
    return await this.pizzaService.update(data);
  }

  // * Добавить конкретный ингредиент к пицце (для админа)
  @MessagePattern('admin_add_ingredient_to_pizza')
  async addIngredientToPizza(@Payload() data: AddIngredientToPizzaPayload) {
    return await this.pizzaService.addIngredient(data.pizzaId, data.ingredientId);
  }

  // * Удалить конкретный ингредиент из пиццы (для админа)
  @MessagePattern('admin_remove_ingredient_from_pizza')
  async removeIngredientFromPizza(@Payload() data: RemoveIngredientFromPizzaPayload) {
    return await this.pizzaService.removeIngredient(data.pizzaId, data.ingredientId);
  }

  // * Удалить пиццу из меню по ID вместе с файлом (для админа)
  @MessagePattern('admin_delete_pizza')
  async deletePizza(@Payload() data: { pizzaId: number }) {
    return await this.pizzaService.deletePizza(data.pizzaId);
  }
}
