// * Контроллер очередей микросервиса меню пицц (работает через сообщения RabbitMQ)

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

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
  constructor(
    private readonly pizzaService: PizzaService,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @MessagePattern('get_pizzas_list')
  async getPizzasList(@Payload() data: PizzaPaginationPayload) {
    return await this.pizzaService.findPaginated(data);
  }

  @MessagePattern('get_pizza_detail')
  async getPizzaDetail(@Payload() data: { pizzaId: number }) {
    return await this.pizzaService.findDetailById(data.pizzaId);
  }

  @MessagePattern('admin_create_pizza')
  async createPizza(@Payload() data: CreatePizzaPayload) {
    return await this.pizzaService.create(data);
  }

  @MessagePattern('admin_edit_pizza')
  async editPizza(@Payload() data: UpdatePizzaPayload) {
    return await this.pizzaService.update(data);
  }

  @MessagePattern('admin_add_ingredient_to_pizza')
  async addIngredientToPizza(@Payload() data: AddIngredientToPizzaPayload) {
    return await this.pizzaService.addIngredient(data.pizzaId, data.ingredientId);
  }

  @MessagePattern('admin_remove_ingredient_from_pizza')
  async removeIngredientFromPizza(@Payload() data: RemoveIngredientFromPizzaPayload) {
    return await this.pizzaService.removeIngredient(data.pizzaId, data.ingredientId);
  }

  @MessagePattern('admin_delete_pizza')
  async deletePizza(@Payload() data: { pizzaId: number }) {
    return await this.pizzaService.deletePizza(data.pizzaId);
  }

  // Проверка доступности базы данных (Health Check)
  @MessagePattern('pizza_service_ping_db')
  async checkDatabaseStatus() {
    try {
      const result = await this.health.check([() => this.db.pingCheck('database')]);
      return { status: 'up', details: result.info };
    } catch (error: any) {
      return { status: 'down', message: error.message };
    }
  }
}
