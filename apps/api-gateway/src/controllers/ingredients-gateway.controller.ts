// * Контроллер ингредиентов пиццы
// Доступен только для администратора

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseFilters,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

// Импорт DTO
import { CreateIngredientDto } from '../dto/ingredients/create-ingredient.dto';
import { IngredientResponseDto } from '../dto/ingredients/ingredient-response.dto';

@ApiTags('Ingredients')
@ApiBearerAuth('bearerAuth') // Требует JWT токен (иконка замочка)
@Roles('admin')
@Controller('admin/ingredients') // Базовый префикс для всех эндпоинтов управления
@UseFilters(RpcExceptionFilter)
export class IngredientsGatewayController {
  constructor(
    // Инжектируем прокси для работы с микросервисом каталога пиццы/ингредиентов
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy,
  ) {}

  // * Получить все ингредиенты пиццы (GET /admin/ingredients)
  @Get()
  @ApiOperation({ 
    summary: 'Получить все ингредиенты пиццы', 
    description: 'Возвращает полный список доступных ингредиентов. Доступно только админу.' 
  })
  @ApiOkResponse({ 
    description: 'Список ингредиентов успешно получен.', 
    type: [IngredientResponseDto] // Массив объектов
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (требуется роль admin).' })
  getAllIngredients() {
    return this.pizzaClient.send('get_all_ingredients', {});
  }

  // * Добавить ингредиент пиццы (создать ингредиент) (POST admin/ingredients/add)
  @Post('add')
  @ApiOperation({ 
    summary: 'Добавить новый ингредиент пиццы', 
    description: 'Создает новый ингредиент каталога. Доступно только админу.' 
  })
  @ApiCreatedResponse({ 
    description: 'Ингредиент успешно создан.', 
    type: IngredientResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих полей.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 409, description: 'Ингредиент с таким названием уже существует.' })
  createIngredient(@Body() body: CreateIngredientDto) {
    return this.pizzaClient.send('create_ingredient', body);
  }

  // * Изменить ингредиент пиццы по его id (PUT admin/ingredients/:id)
  @Put(':id')
  @ApiOperation({ 
    summary: 'Изменить ингредиент пиццы по ID', 
    description: 'Обновляет данные существующего ингредиента по его уникальному идентификатору.' 
  })
  @ApiOkResponse({ 
    description: 'Ингредиент успешно изменен. Возвращает обновленный объект.', 
    type: IngredientResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Неверный формат ID или ошибка валидации полей.' })
  @ApiResponse({ status: 404, description: 'Ингредиент с указанным ID не найден.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  updateIngredient(
    @Param('id', ParseIntPipe) id: number, 
    @Body() body: CreateIngredientDto,
  ) {
    return this.pizzaClient.send('update_ingredient', { id, ...body });
  }

  // * Удалить ингредиент пиццы по его id (DELETE admin/ingredients/:id)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // При успешном удалении возвращаем 204 No Content
  @ApiOperation({ 
    summary: 'Удалить ингредиент пиццы по ID', 
    description: 'Удаляет ингредиент из системы. Автоматически очищает связи в промежуточных таблицах благодаря CASCADE.' 
  })
  @ApiResponse({ status: 204, description: 'Ингредиент успешно удален. Ничего не возвращает.' })
  @ApiResponse({ status: 400, description: 'Неверный формат ID.' })
  @ApiResponse({ status: 404, description: 'Ингредиент с указанным ID не найден.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  deleteIngredient(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('delete_ingredient', { id });
  }
}
