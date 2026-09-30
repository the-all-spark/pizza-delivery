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
  ApiConsumes,
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import { CreatePizzaDto } from '../dto/pizzas/create-pizza.dto';
import { UpdatePizzaDto } from '../dto/pizzas/update-pizza.dto.';
import { AddIngredientToPizzaDto } from '../dto/pizzas/add-ingredient-to-pizza.dto';
import { PizzaResponseDto } from '../dto/pizzas/pizza-response.dto';
import { PizzaListResponseDto } from '../dto/pizzas/pizza-list-response.dto';

@ApiTags('Pizzas')
@ApiBearerAuth('bearerAuth')
@Controller('pizzas')
@UseFilters(RpcExceptionFilter)
export class PizzasGatewayController {
  constructor(@Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy) {}

  // ==========================================
  // ОБЩИЕ МАРШРУТЫ И МАРШРУТЫ АДМИНИСТРАТОРА
  // ==========================================

  // * Получить список всех пицц (GET /pizzas)
  @Get()
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Get a paginated list of all pizzas',
    description:
      'Available to all authorized users. Returns pizzas without a detailed list of ingredients.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    example: 1,
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    example: 10,
    required: true,
  })
  @ApiOkResponse({
    description: 'Pizza list successfully retrieved.',
    type: PizzaListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getPizzas(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.pizzaClient.send('get_pizzas_list', { page, limit });
  }

  // * Создать пиццу (POST /pizzas)
  @Post()
  @Roles('admin')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new pizza in the menu',
    description:
      'Available only to administrators. Allows creating a pizza with a mandatory array of ingredient IDs specified.',
  })
  @ApiCreatedResponse({
    description: 'Pizza successfully added to the menu.',
    type: PizzaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error of the incoming fields.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Access denied (admin role required).',
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'pizzas');
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          callback(null, `pizza-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async createPizza(@UploadedFile() file: any, @Body() body: CreatePizzaDto) {
    if (!file) {
      throw new Error('Pizza image is a required field.');
    }

    const imageUrl = `/uploads/pizzas/${file.filename}`;
    const absoluteFilePath = path.join(process.cwd(), 'uploads', 'pizzas', file.filename);

    // Пансинг ингредиентов для multipart/form-data (из строки в массив чисел)
    let ingredientIds: number[] = [];
    const rawIngredients = body.ingredients;

    try {
      if (typeof rawIngredients === 'string') {
        if (rawIngredients.startsWith('[') && rawIngredients.endsWith(']')) {
          ingredientIds = JSON.parse(rawIngredients).map((id: any) => Number(id));
        } else {
          ingredientIds = rawIngredients.split(',').map((id) => Number(id.trim()));
        }
      }
      ingredientIds = ingredientIds.filter((id) => !isNaN(id) && id > 0);
    } catch {
      const fs = require('fs');
      if (fs.existsSync(absoluteFilePath)) fs.unlinkSync(absoluteFilePath);
      throw new Error('Invalid ingredients field format. Use format: 1,2,3,5');
    }

    try {
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
      const fs = require('fs');
      if (fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
        console.log(`🧹 Мусорный файл ${file.filename} успешно зачищен после ошибки микросервиса.`);
      }
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
    summary: 'Get detailed pizza information by ID',
    description:
      'Available to all authorized users. Returns description, image, and a complete array of nested ingredient entities.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique pizza ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Pizza details successfully retrieved.',
    type: PizzaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Pizza with the specified ID not found.' })
  getPizzaDetail(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('get_pizza_detail', { pizzaId: id });
  }

  // * Изменить параметры пиццы по ее id (PUT /pizzas/:id)
  @Put(':id')
  @Roles('admin')
  @ApiOperation({
    summary: 'Edit pizza parameters by ID',
    description:
      'Available only to administrators. Allows updating pizza data partially or completely (title, description, price, image).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique pizza ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Pizza data successfully updated.',
    type: PizzaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID or validation error of the submitted fields.',
  })
  @ApiResponse({ status: 404, description: 'Pizza with this ID not found.' })
  @ApiResponse({
    status: 409,
    description: 'Pizza with this title already exists.',
  })
  editPizza(@Param('id', ParseIntPipe) id: number, @Body() body: UpdatePizzaDto) {
    return this.pizzaClient.send('admin_edit_pizza', { pizzaId: id, ...body });
  }

  // * Добавить конкретный ингредиент к пицце (POST /pizzas/:id/ingredients)
  @Post(':id/ingredients')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Add a specific ingredient to a pizza',
    description:
      'Available only to administrators. Allows linking a new ingredient to an existing pizza.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique pizza ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Ingredient successfully added to the pizza.',
    type: PizzaResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid pizza ID or ingredient ID.',
  })
  @ApiResponse({ status: 404, description: 'Pizza or ingredient not found.' })
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
    summary: 'Remove a specific ingredient from a pizza',
    description:
      'Available only to administrators. Allows unlinking (removing) an ingredient from the recipe of an existing pizza.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique pizza ID',
    example: 1,
  })
  @ApiParam({
    name: 'ingredientId',
    type: Number,
    description: 'ID of the ingredient to remove',
    example: 3,
  })
  @ApiNoContentResponse({
    description: 'Ingredient successfully removed from the pizza. Returns no content.',
  })
  @ApiResponse({ status: 400, description: 'Invalid IDs.' })
  @ApiResponse({
    status: 404,
    description: 'Pizza or ingredient not found in this pizza.',
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
    summary: 'Delete pizza from the menu by ID',
    description:
      'Available only to administrators. Completely removes the pizza and clears its relations in the join table.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique pizza ID',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Pizza successfully deleted from the menu. Returns no content.',
  })
  @ApiResponse({ status: 400, description: 'Invalid pizza ID format.' })
  @ApiResponse({ status: 404, description: 'Pizza with the specified ID not found.' })
  deletePizza(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('admin_delete_pizza', { pizzaId: id });
  }
}
