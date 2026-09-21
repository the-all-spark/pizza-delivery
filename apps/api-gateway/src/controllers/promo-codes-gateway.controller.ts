// * Контроллер для промо-кодов

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
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiOkResponse, 
  ApiCreatedResponse,
  ApiParam,             
  ApiNoContentResponse
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import { CreatePromoCodeDto } from '../dto/promo-codes/create-promo-code.dto';
import { UpdatePromoCodeDto } from '../dto/promo-codes/update-promo-code.dto';
import { PromoCodeResponseDto } from '../dto/promo-codes/promo-code-response.dto';

@ApiTags('Promo-codes')
@ApiBearerAuth('bearerAuth')
@Controller('promo-codes') 
@UseFilters(RpcExceptionFilter)
export class PromoCodesGatewayController {
  constructor(
    @Inject('PIZZA_SERVICE') private readonly pizzaClient: ClientProxy
  ) {}

  // ========================
  // ОБЩИЕ МАРШРУТЫ И МАРШРУТЫ КОЛЛЕКЦИЙ (ВВЕРХУ)
  // ========================

  // * Получить список всех промо-кодов (GET /promo-codes)
  @Get()
  @Roles('user', 'admin')
  @ApiOperation({ 
    summary: 'Get a list of all promo codes', 
    description: 'Available to authorized users and administrators. Returns a list of coupons.' 
  })
  @ApiOkResponse({ description: 'Promo code list successfully retrieved.', type: [PromoCodeResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getAllPromoCodes() {
    return this.pizzaClient.send('get_all_promo_codes', {});
  }

  // * Создать промокод (POST /promo-codes)
  @Post()
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Create a new promo code', 
    description: 'Available only to administrators. Creates a discount coupon with validity time.' 
  })
  @ApiCreatedResponse({ description: 'Promo code successfully created.', type: PromoCodeResponseDto })
  @ApiResponse({ status: 400, description: 'Field validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Access denied (admin role required).' })
  @ApiResponse({ status: 409, description: 'Promo code with this text (code) already exists.' })
  createPromoCode(@Body() body: CreatePromoCodeDto) {
    return this.pizzaClient.send('admin_create_promo_code', body);
  }

  // ========================
  // МАРШРУТЫ ДЛЯ КОНКРЕТНЫХ СУЩНОСТЕЙ ПО ID
  // ========================

  // * Изменить существующий промо-код по его id (PUT /promo-codes/:id)
  @Put(':id')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Update an existing promo code by ID', 
    description: 'Available only to administrators. Allows updating coupon parameters.' 
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Unique promo code identifier',
    example: 1,
  })
  @ApiOkResponse({ description: 'Promo code successfully updated.', type: PromoCodeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid ID or data validation error.' })
  @ApiResponse({ status: 404, description: 'Promo code with the specified ID not found.' })
  @ApiResponse({ status: 403, description: 'Access denied (admin role required).' })
  updatePromoCode(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePromoCodeDto
  ) {
    return this.pizzaClient.send('admin_update_promo_code', { promoId: id, ...body });
  }

  // * Получить конкретный промокод по его id (GET /promo-codes/:id)
  @Get(':id')
  @Roles('admin', 'user') // Доступно всем авторизованным ролям
  @ApiOperation({ 
    summary: 'Get promo code information by ID', 
    description: 'Returns details about the coupon, its status, and discount percentage.' 
  })
  @ApiParam({ name: 'id', type: Number, description: 'Unique promo code identifier', example: 1 })
  @ApiOkResponse({ description: 'Promo code successfully found and retrieved.', type: PromoCodeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Promo code not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getPromoCodeById(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('get_promo_code_by_id', { id });
  }

  // * Удалить промо-код по id (DELETE /promo-codes/:id)
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete promo code by ID', 
    description: 'Available only to administrators. Deletes the promo code.' 
  })
  @ApiNoContentResponse({ description: 'Promo code successfully deleted. Returns no content.' })
  @ApiResponse({ status: 400, description: 'Invalid ID format.' })
  @ApiResponse({ status: 404, description: 'Promo code not found.' })
  @ApiResponse({ status: 403, description: 'Access denied (admin role required).' })
  deletePromoCode(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('admin_delete_promo_code', { promoId: id });
  }
}
