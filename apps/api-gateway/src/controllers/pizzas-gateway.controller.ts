// * Контроллер меню пицц

import { 
  Controller, Post, Get, Put, Delete, Body, Param, Inject, UseFilters, Query, ParseIntPipe, HttpCode, HttpStatus
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiOkResponse, 
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import { CreatePizzaDto } from '../dto/pizzas/create-pizza.dto';
import { UpdatePizzaDto } from '../dto/pizzas/update-pizza.dto.';
import { AddIngredientToPizzaDto } from '../dto/pizzas/add-ingredient-to-pizza.dto';
import { PizzaResponseDto } from '../dto/pizzas/pizza-response.dto';

@ApiTags('Pizzas') 
@ApiBearerAuth('bearerAuth')
@Controller('pizzas') // Базовый префикс для всех эндпоинтов
@UseFilters(RpcExceptionFilter)
export class PizzasGatewayController {
  constructor(
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy
  ) {}

  // ==========================================
  // ОБЩИЕ МАРШРУТЫ И МАРШРУТЫ АДМИНИСТРАТОРА (КОЛЛЕКЦИИ)
  // ==========================================

  // * Получить список всех пицц (GET /pizzas)
  @Get()
  @Roles('user', 'admin')
  @ApiOperation({ 
    summary: 'Получить постраничный список всех пицц', 
    description: 'Доступно всем авторизованным пользователям. Возвращает пиццы без детального списка ингредиентов.' 
  })
  @ApiQuery({ name: 'page', description: 'Номер страницы', example: 1, required: true })
  @ApiQuery({ name: 'limit', description: 'Элементов на страницу', example: 10, required: true })
  @ApiOkResponse({ description: 'Список пицц успешно получен.', type: [PizzaResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  getPizzas(
    @Query('page', ParseIntPipe) page: number, 
    @Query('limit', ParseIntPipe) limit: number
  ) {
    return this.pizzaClient.send('get_pizzas_list', { page, limit });
  }

  // * Создать пиццу (POST /pizzas)
  @Post()
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Создать новую пиццу в меню', 
    description: 'Доступно только администратору. Позволяет создать пиццу с обязательным указанием массива ID ингредиентов.' 
  })
  @ApiCreatedResponse({ description: 'Пицца успешно добавлена в меню.', type: PizzaResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих полей.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (требуется роль admin).' })
  createPizza(@Body() body: CreatePizzaDto) {
    return this.pizzaClient.send('admin_create_pizza', body);
  }

  // ==========================================
  // МАРШРУТЫ ДЛЯ КОНКРЕТНЫХ СУЩНОСТЕЙ ПО ID
  // ==========================================

  // * Получить детали конкретной пиццы по ее id (GET /pizzas/:id)
  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({ 
    summary: 'Получить детальную информацию о пицце по ID', 
    description: 'Доступно всем авторизованным пользователям. Возвращает описание, картинку и полный массив сущностей вложенных ингредиентов.' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID пиццы', example: 1 })
  @ApiOkResponse({ description: 'Детали пиццы успешно получены.', type: PizzaResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный формат ID.' })
  @ApiResponse({ status: 404, description: 'Пицца с указанным ID не найдена.' })
  getPizzaDetail(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('get_pizza_detail', { pizzaId: id });
  }

  // * Изменить параметры пиццы по ее id (PUT /pizzas/:id)
  @Put(':id')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Редактировать параметры пиццы по ее ID', 
    description: 'Доступно только администратору. Позволяет частично или полностью обновить данные пиццы (название, описание, цену, картинку).' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID пиццы', example: 1 })
  @ApiOkResponse({ description: 'Данные пиццы успешно обновлены.', type: PizzaResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидный ID или ошибка валидации переданных полей.' })
  @ApiResponse({ status: 404, description: 'Пицца с таким ID не найдена.' })
  @ApiResponse({ status: 409, description: 'Пицца с таким названием (title) уже существует.' })
  editPizza(
    @Param('id', ParseIntPipe) id: number, 
    @Body() body: UpdatePizzaDto
  ) {
    return this.pizzaClient.send('admin_edit_pizza', { pizzaId: id, ...body });
  }

  // * Добавить конкретный ингредиент к пицце (POST /pizzas/:id/ingredients)
  @Post(':id/ingredients')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Добавить конкретный ингредиент к пицце', 
    description: 'Доступно только администратору. Позволяет привязать новый ингредиент к существующей пицце.' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID пиццы', example: 1 })
  @ApiOkResponse({ description: 'Ингредиент успешно добавлен к пицце.', type: PizzaResponseDto })
  @ApiResponse({ status: 400, description: 'Невалидный ID пиццы или ID ингредиента.' })
  @ApiResponse({ status: 404, description: 'Пицца или ингредиент не найдены.' })
  addIngredientToPizza(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddIngredientToPizzaDto
  ) {
    return this.pizzaClient.send('admin_add_ingredient_to_pizza', { pizzaId: id, ingredientId: body.ingredientId });
  }

  // * Удалить пиццу по id (DELETE /pizzas/:id)
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Удалить пиццу из меню по ID', 
    description: 'Доступно только администратору. Полностью удаляет пиццу и очищает её связи в промежуточной таблице.' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'Уникальный ID пиццы', example: 1 })
  @ApiNoContentResponse({ description: 'Пицца успешно удалена из меню. Ничего не возвращает.' })
  @ApiResponse({ status: 400, description: 'Неверный формат ID пиццы.' })
  @ApiResponse({ status: 404, description: 'Пицца с указанным ID не найдена.' })
  deletePizza(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('admin_delete_pizza', { pizzaId: id });
  }
}
