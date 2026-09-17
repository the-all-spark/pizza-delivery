// * Контроллер пользователей

import {
  Controller,
  Delete,
  Get,
  Put,
  Req,
  Query,
  UseFilters,
  Body,
  ParseIntPipe, // пайп для валидации чисел
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
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

// Импорт DTO
import { SearchUserQueryDto } from '../dto/users/search-user-query.dto';
import { UpdateProfileDto } from '../dto/users/update-profile.dto';
import { RegisterResponseDto } from '../dto/auth/register-response.dto'; // DTO для отображения схем пользователей

@ApiTags('Users')
@ApiBearerAuth('bearerAuth')
@Controller()
@UseFilters(RpcExceptionFilter)
export class UsersGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  // * Поиск пользователя по имени и фамилии
  // Маршрут 'search' должен быть выше метода 'admin/users'
  // чтобы NestJS не принял слово 'search' за значение пагинации и не выдал  ошибку
  @Get('admin/users/search')
  @Roles('admin')
  @ApiOperation({
    summary: 'Поиск пользователя по имени и фамилии',
    description:
      'Доступно только администраторам. Ищет пользователей по точному или частичному совпадению.',
  })
  @ApiOkResponse({
    description: 'Пользователи успешно найдены.',
    type: [RegisterResponseDto], // Оборачиваем в массив [], так как поиск возвращает список
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации (firstName или lastName не переданы).',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован (JWT-токен отсутствует или невалидный).',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (требуется роль admin).',
  })
  searchUser(@Query() query: SearchUserQueryDto) {
    return this.authClient.send('user_search', {
      firstName: query.firstName,
      lastName: query.lastName,
    });
  }

  // * Список пользователей с пагинацией
  @Get('admin/users')
  @Roles('admin')
  @ApiOperation({
    summary: 'Получение списка всех пользователей',
    description:
      'Доступно только администраторам. Возвращает постраничный список зарегистрированных пользователей.',
  })
  // Документируем query-параметры пагинации вручную, так как они передаются через примитивные типы (ParseIntPipe)
  @ApiQuery({
    name: 'page',
    description: 'Номер страницы (начиная с 1)',
    example: 1,
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Количество элементов на странице',
    example: 10,
    required: true,
  })
  @ApiOkResponse({
    description: 'Список пользователей успешно получен.',
    type: [RegisterResponseDto], // Показывает массив объектов пользователей
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({
    status: 403,
    description: 'Доступ запрещен (требуется роль admin).',
  })
  getAllUsers(
    // Добавлен ParseIntPipe (без него page и limit придут как string)
    // что вызовет падение базы данных при передаче этих данных в микросервис.
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.authClient.send('admin_get_users', { page, limit });
  }

  // * Редактирование профиля пользователя (First Name, Last Name) и смена пароля
  @Put('users/profile/edit')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Редактирование личного профиля',
    description:
      'Доступно авторизованным пользователям. Позволяет обновить имя, фамилию или пароль.',
  })
  @ApiOkResponse({
    description: 'Профиль успешно обновлен. Возвращает обновленные данные.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ошибка валидации переданных полей.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  editProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ) {
    return this.authClient.send('user_edit_profile', {
      userId: req.user.userId,
      firstName: body.firstName,
      lastName: body.lastName,
      password: body.password,
    });
  }

  // * Удаление аккаунта пользователя
  @Delete('users/profile/delete')
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT) // Задаем статус 204 No Content, так как при удалении тело ответа обычно пустое при удалении
  @ApiOperation({
    summary: 'Удаление собственного аккаунта',
    description:
      'Доступно авторизованным пользователям. Полностью удаляет профиль текущего пользователя из системы.',
  })
  @ApiResponse({
    status: 204,
    description: 'Аккаунт успешно удален. Ничего не возвращает.',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  deleteAccount(@Req() req: AuthenticatedRequest) {
    return this.authClient.send('user_delete_account', {
      userId: req.user.userId,
    });
  }
}
