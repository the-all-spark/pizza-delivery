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
  ApiQuery
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
@Controller('users')
@UseFilters(RpcExceptionFilter)
export class UsersGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  // * Получение списка пользователей / Поиск по имени и фамилии
  // один эндпоинт GET /users, где все параметры опциональны или имеют дефолтные значения.
  @Get()
  @Roles('admin')
  @ApiOperation({
    summary: 'Получение списка пользователей с фильтрацией и пагинацией',
    description:
      'Доступно только администраторам. Позволяет искать пользователей по имени/фамилии, а также получать постраничный список.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Номер страницы (начиная с 1)',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Количество элементов на странице',
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: 'firstName',
    description: 'Имя пользователя для поиска',
    required: false,
  })
  @ApiQuery({
    name: 'lastName',
    description: 'Фамилия пользователя для поиска',
    required: false,
  })
  @ApiOkResponse({
    description: 'Список пользователей успешно получен.',
    type: [RegisterResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован.' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (требуется роль admin).' })
  getUsers(
    // флаг { optional: true }, чтобы при поиске по имени параметры пагинации не падали с ошибкой, если они не переданы
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query() searchDto?: SearchUserQueryDto,
  ) {
    // Если переданы параметры поиска, вызываем микросервис поиска
    // GET /users?firstName=John&lastName=Smith
    // GET /users?firstName=John
    // GET /users?lastName=Smith
    if (searchDto?.firstName || searchDto?.lastName) {
      return this.authClient.send('user_search', {
        firstName: searchDto.firstName,
        lastName: searchDto.lastName,
      });
    }
    
    // Иначе отдаем список с пагинацией (задаем дефолтные значения, если они не пришли)
    // GET /users?page=2&limit=20
    // GET /users
    return this.authClient.send('admin_get_users', { 
      page: page ?? 1, 
      limit: limit ?? 10 
    });
  }

  // * Редактирование профиля пользователя (First Name, Last Name) и смена пароля
  // PUT /users/profile
  @Put('profile')
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
  //  DELETE /users/profile
  @Delete('profile')
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
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
