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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

// Импорт DTO
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
  // МАРШРУТЫ АДМИНИСТРАТОРА
  // ========================

  // * Создать промокод (POST /promo-codes/admin/add)
  @Post('admin/add')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Создать новый промокод', 
    description: 'Доступно только администратору. Создает купон со скидкой и временем действия.' 
  })
  @ApiCreatedResponse({ description: 'Промокод успешно создан.', type: PromoCodeResponseDto })
  @ApiResponse({ status: 400, description: 'Ошибка валидации полей.' })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (требуется роль admin).' })
  @ApiResponse({ status: 409, description: 'Промокод с таким текстом (code) уже существует.' })
  createPromoCode(@Body() body: CreatePromoCodeDto) {
    return this.pizzaClient.send('admin_create_promo_code', body);
  }

  // * Изменить существующий промо-код по его id (PUT /promo-codes/admin/:id/edit)
  @Put('admin/:id/edit')
  @Roles('admin')
  @ApiOperation({ 
    summary: 'Изменить существующий промокод по ID', 
    description: 'Доступно только администратору. Позволяет обновить параметры купона.' 
  })
  @ApiOkResponse({ description: 'Промокод успешно обновлен.', type: PromoCodeResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный ID или ошибка валидации данных.' })
  @ApiResponse({ status: 404, description: 'Промокод с указанным ID не найден.' })
  updatePromoCode(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePromoCodeDto
  ) {
    return this.pizzaClient.send('admin_update_promo_code', { promoId: id, ...body });
  }

  // * Удалить промо-код по id (DELETE /promo-codes/admin/:id/delete)
  @Delete('admin/:id/delete')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Удалить промокод по ID', 
    description: 'Доступно только администратору. Удаляет промокод. В таблице заказов у старых чеков поле promo_code_id сбросится в NULL (onDelete: SET NULL).' 
  })
  @ApiResponse({ status: 204, description: 'Промокод успешно удален. Ничего не возвращает.' })
  @ApiResponse({ status: 400, description: 'Неверный формат ID.' })
  @ApiResponse({ status: 404, description: 'Промокод не найден.' })
  deletePromoCode(@Param('id', ParseIntPipe) id: number) {
    return this.pizzaClient.send('admin_delete_promo_code', { promoId: id });
  }

  // ========================
  // ОБЩИЕ МАРШРУТЫ
  // ========================

  // * Получить список всех промо-кодов (GET /promo-codes)
  @Get()
  @Roles('user', 'admin')
  @ApiOperation({ 
    summary: 'Получить список всех промокодов', 
    description: 'Доступно авторизованным пользователям и администраторам. Возвращает список купонов.' 
  })
  @ApiOkResponse({ description: 'Список промокодов успешно получен.', type: [PromoCodeResponseDto] })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  getAllPromoCodes() {
    return this.pizzaClient.send('get_all_promo_codes', {});
  }
}
