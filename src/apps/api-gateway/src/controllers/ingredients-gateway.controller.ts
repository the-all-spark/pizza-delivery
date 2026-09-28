// * Контроллер ингредиентов пиццы

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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import { CreateIngredientDto } from '../dto/ingredients/create-ingredient.dto';
import { IngredientResponseDto } from '../dto/ingredients/ingredient-response.dto';

@ApiTags('Ingredients')
@ApiBearerAuth('bearerAuth')
@Roles('admin')
@Controller('ingredients')
@UseFilters(RpcExceptionFilter)
export class IngredientsGatewayController {
  constructor(
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy,
  ) {}

  // * Получить все ингредиенты пиццы (GET /ingredients)
  @Get()
  @ApiOperation({
    summary: 'Get all pizza ingredients',
    description: 'Returns a full list of available ingredients. Available only to admin.',
  })
  @ApiOkResponse({
    description: 'Ingredient list successfully retrieved.',
    type: [IngredientResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Access denied (admin role required).',
  })
  getAllIngredients() {
    return this.pizzaClient.send('get_all_ingredients', {});
  }

  // * Получить конкретный ингредиент пиццы по его id (GET /ingredients/:id)
  @Get(':id')
  @ApiOperation({
    summary: 'Get pizza ingredient by ID',
    description: 'Returns detailed information for a specific ingredient. Available only to admin.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique ingredient identifier',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Ingredient successfully found and retrieved.',
    type: IngredientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Ingredient with the specified ID not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getIngredientById(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('get_ingredient_by_id', { id });
  }

  // * Добавить ингредиент пиццы (создать ингредиент) (POST /ingredients)
  @Post()
  @ApiOperation({
    summary: 'Add a new pizza ingredient',
    description: 'Creates a new catalog ingredient. Available only to admin.',
  })
  @ApiCreatedResponse({
    description: 'Ingredient successfully created.',
    type: IngredientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error of the incoming fields.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 409,
    description: 'Ingredient with this name already exists.',
  })
  createIngredient(@Body() body: CreateIngredientDto) {
    return this.pizzaClient.send('create_ingredient', body);
  }

  // * Изменить ингредиент пиццы по его id (PUT /ingredients/:id)
  @Put(':id')
  @ApiOperation({
    summary: 'Update pizza ingredient by ID',
    description: 'Updates data of an existing ingredient by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique ingredient identifier',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Ingredient successfully updated. Returns the updated object.',
    type: IngredientResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format or field validation error.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ingredient with the specified ID not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateIngredient(@Param('id', ParseIntPipe) id: number, @Body() body: CreateIngredientDto) {
    return this.pizzaClient.send('update_ingredient', { id, ...body });
  }

  // * Удалить ингредиент пиццы по его id (DELETE /ingredients/:id)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete pizza ingredient by ID',
    description:
      'Removes the ingredient from the system. Automatically clears relations in join tables thanks to CASCADE.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique ingredient identifier',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Ingredient successfully deleted. Returns no content.',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({
    status: 404,
    description: 'Ingredient with the specified ID not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  deleteIngredient(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('delete_ingredient', { id });
  }
}
