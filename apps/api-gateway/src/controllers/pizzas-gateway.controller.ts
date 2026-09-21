// * Контроллер меню пицц

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  UseFilters,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes, // импорт поддержки файлов в Swagger
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import { CreatePizzaDto } from '../dto/pizzas/create-pizza.dto';
import { UpdatePizzaDto } from '../dto/pizzas/update-pizza.dto.';
import { AddIngredientToPizzaDto } from '../dto/pizzas/add-ingredient-to-pizza.dto';
import { PizzaResponseDto } from '../dto/pizzas/pizza-response.dto';

@ApiTags('Pizzas')
@ApiBearerAuth('bearerAuth')
@Controller('pizzas')
@UseFilters(RpcExceptionFilter)
export class PizzasGatewayController {
  constructor(
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy,
  ) {}

  // ==========================================
  // ОБЩИЕ МАРШРУТЫ И МАРШРУТЫ АДМИНИСТРАТОРА (КОЛЛЕКЦИИ)
  // ==========================================

  // * Получить список всех пицц (GET /pizzas)
  @Get()
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Получить постраничный список всех пицц',
    description:
      'Доступно всем авторизованным пользователям. Возвращает пиццы без детального списка ингредиентов.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Номер страницы',
    example: 1,
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Элементов на страницу',
    example: 10,
    required: true,
  })
  @ApiOkResponse({
    description: 'Список пицц успешно получен.',
    type: [PizzaResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  getPizzas(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.pizzaClient.send('get_pizzas_list', { page, limit });
  }

  // * Создать пиццу (POST /pizzas)
  @Post()
  @Roles('admin')
  @ApiConsumes('multipart/form-data') // отобразит полноценную кнопку загрузки файла
  @ApiOperation({
    summary: 'Создать новую пиццу в меню',
    description:
      'Доступно только администратору. Позволяет создать пиццу с обязательным указанием массива ID ингредиентов.',
  })
  @ApiCreatedResponse({
    description: 'Пицца успешно добавлена в меню.',
    type: PizzaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих полей.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (требуется роль admin).',
  })
  // Подключаем перехватчик файла "image". Сохраняем физически в общую папку uploads на диск
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './apps/pizza-service/uploads', // Путь, куда физически ляжет файл
        filename: (req, file, callback) => {
          // Генерируем уникальное и безопасное имя файла (текущее_время + случайное_число + оригинальное_расширение)
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          callback(null, `pizza-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createPizza(
    @UploadedFile() file: any, // Извлекаем перехваченный файл картинки
    @Body() body: CreatePizzaDto,
  ) {
    // Если администратор забыл прикрепить файл — прерываем операцию
    if (!file) {
      throw new Error('Изображение пиццы является обязательным полем.');
    }

    // Формируем текстовую ссылку на изображение
    const imageUrl = `/uploads/${file.filename}`;

    // Вычисляем абсолютный путь к файлу на случай, если его придется удалить при ошибке
    const absoluteFilePath = path.join(
      process.cwd(),
      'apps',
      'pizza-service',
      'uploads',
      file.filename,
    );

    // парсер ингредиентов для multipart/form-data (из строки в массив чисел)
    let ingredientIds: number[] = [];
    const rawIngredients = body.ingredients;

    try {
      if (typeof rawIngredients === 'string') {
        // Если админ ввел в формате JSON-массива "[1,2,3,5]"
        if (rawIngredients.startsWith('[') && rawIngredients.endsWith(']')) {
          ingredientIds = JSON.parse(rawIngredients).map((id: any) =>
            Number(id),
          );
        } else {
          // Если админ ввел через запятую "1,2,3,5"
          ingredientIds = rawIngredients
            .split(',')
            .map((id) => Number(id.trim()));
        }
      }
      // Дополнительная валидация: фильтруем пустые или некорректные ID (NaN)
      ingredientIds = ingredientIds.filter((id) => !isNaN(id) && id > 0);
    } catch {
      // Если парсинг строки не удался — физически стираем только что сохраненный файл
      const fs = require('fs');
      if (fs.existsSync(absoluteFilePath)) fs.unlinkSync(absoluteFilePath);
      throw new Error(
        'Неверный формат поля ingredients. Используйте формат: 1,2,3,5',
      );
    }

    try {
      // Отправляем запрос в микросервис каталога пиццы и ждем ответ через await
      return await firstValueFrom(
        this.pizzaClient.send('admin_create_pizza', {
          title: body.title,
          description: body.description,
          price: Number(body.price),
          imageUrl: imageUrl,
          ingredients: ingredientIds,
        }),
      );
    } catch (microserviceError) {
      // Если микросервис вернул ошибку (например, 400 Неверный ID ингредиента),
      // мы мгновенно зачищаем файл с диска, чтобы папка uploads оставалась чистой
      const fs = require('fs');
      if (fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
        console.log(
          `🧹 Мусорный файл ${file.filename} успешно зачищен после ошибки микросервиса.`,
        );
      }
      // Пробрасываем ошибку дальше в RpcExceptionFilter
      throw microserviceError;
    }
  }

  // ==========================================
  // МАРШРУТЫ ДЛЯ КОНКРЕТНЫХ СУЩНОСТЕЙ ПО ID
  // ==========================================

  // * Получить детали конкретной пиццы по ее id (GET /pizzas/:id)
  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Получить детальную информацию о пицце по ID',
    description:
      'Доступно всем авторизованным пользователям. Возвращает описание, картинку и полный массив сущностей вложенных ингредиентов.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Уникальный ID пиццы',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Детали пиццы успешно получены.',
    type: PizzaResponseDto,
  })
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
    description:
      'Доступно только администратору. Позволяет частично или полностью обновить данные пиццы (название, описание, цену, картинку).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Уникальный ID пиццы',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Данные пиццы успешно обновлены.',
    type: PizzaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Невалидный ID или ошибка валидации переданных полей.',
  })
  @ApiResponse({ status: 404, description: 'Пицца с таким ID не найдена.' })
  @ApiResponse({
    status: 409,
    description: 'Пицца с таким названием (title) уже существует.',
  })
  editPizza(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePizzaDto,
  ) {
    return this.pizzaClient.send('admin_edit_pizza', { pizzaId: id, ...body });
  }

  // * Добавить конкретный ингредиент к пицце (POST /pizzas/:id/ingredients)
  @Post(':id/ingredients')
  @Roles('admin')
  @HttpCode(HttpStatus.OK) // принудительно указать NestJS возвращать статус 200
  @ApiOperation({
    summary: 'Добавить конкретный ингредиент к пицце',
    description:
      'Доступно только администратору. Позволяет привязать новый ингредиент к существующей пицце.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Уникальный ID пиццы',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Ингредиент успешно добавлен к пицце.',
    type: PizzaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Невалидный ID пиццы или ID ингредиента.',
  })
  @ApiResponse({ status: 404, description: 'Пицца или ингредиент не найдены.' })
  addIngredientToPizza(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddIngredientToPizzaDto,
  ) {
    return this.pizzaClient.send('admin_add_ingredient_to_pizza', {
      pizzaId: id,
      ingredientId: body.ingredientId,
    });
  }

  // * Удалить конкретный ингредиент из пиццы (DELETE /pizzas/:id/ingredients/:ingredientId)
  @Delete(':id/ingredients/:ingredientId')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить конкретный ингредиент из пиццы',
    description:
      'Доступно только администратору. Позволяет отвязать (убрать) ингредиент из рецепта существующей пиццы.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Уникальный ID пиццы',
    example: 1,
  })
  @ApiParam({
    name: 'ingredientId',
    type: Number,
    description: 'ID ингредиента, который нужно убрать',
    example: 3,
  })
  @ApiNoContentResponse({
    description: 'Ингредиент успешно удален из пиццы. Ничего не возвращает.',
  })
  @ApiResponse({ status: 400, description: 'Невалидные ID.' })
  @ApiResponse({
    status: 404,
    description: 'Пицца или ингредиент не найдены в этой пицце.',
  })
  removeIngredientFromPizza(
    @Param('id', ParseIntPipe) id: number,
    @Param('ingredientId', ParseIntPipe) ingredientId: number,
  ) {
    return this.pizzaClient.send('admin_remove_ingredient_from_pizza', {
      pizzaId: id,
      ingredientId,
    });
  }

  // * Удалить пиццу по id (DELETE /pizzas/:id)
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить пиццу из меню по ID',
    description:
      'Доступно только администратору. Полностью удаляет пиццу и очищает её связи в промежуточной таблице.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Уникальный ID пиццы',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Пицца успешно удалена из меню. Ничего не возвращает.',
  })
  @ApiResponse({ status: 400, description: 'Неверный формат ID пиццы.' })
  @ApiResponse({ status: 404, description: 'Пицца с указанным ID не найдена.' })
  deletePizza(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('admin_delete_pizza', { pizzaId: id });
  }
}
