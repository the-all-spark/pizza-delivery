// * Контроллер пользователей

import { Controller, Delete, Get, Req, Query, UseFilters } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

@ApiTags('Users') // Тег
@ApiBearerAuth('bearerAuth') // Рисует иконку замочка рядом с маршрутом (показывает, что нужен токен)
@Controller()
@UseFilters(RpcExceptionFilter)
export class UsersGatewayController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Delete('users/profile')
  @Roles('user', 'admin') // Доступно авторизованным ролям
  deleteAccount(@Req() req: any) {
    // Передаем ID пользователя, который мы извлекли из JWT-токена в Гварде
    return this.authClient.send('user_delete_account', { userId: req.user.userId });
  }

  @Get('admin/users')
  @Roles('admin') // Только для администраторов
  getAllUsers(@Query('page') page: number, @Query('limit') limit: number) {
    // Запрос списка пользователей с пагинацией
    return this.authClient.send('admin_get_users', { page, limit });
  }
}
