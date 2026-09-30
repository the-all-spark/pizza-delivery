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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';

import { Roles } from '../decorators/roles.decorator';
import { RpcExceptionFilter } from '../rpc-exception.filter';

import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

import { SearchUserQueryDto } from '../dto/users/search-user-query.dto';
import { UpdateProfileDto } from '../dto/users/update-profile.dto';
import { RegisterResponseDto } from '../dto/auth/register-response.dto';

@ApiTags('Users')
@ApiBearerAuth('bearerAuth')
@Controller('users')
@UseFilters(RpcExceptionFilter)
export class UsersGatewayController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  // * Получение списка пользователей / Поиск по имени и фамилии (GET /users)
  @Get()
  @Roles('admin')
  @ApiOperation({
    summary: 'Get a list of users with filtering and pagination',
    description:
      'Available only to administrators. Allows searching for users by first name/last name, as well as retrieving a paginated list.',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (starting from 1)',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @ApiQuery({
    name: 'firstName',
    description: 'User first name for search',
    required: false,
  })
  @ApiQuery({
    name: 'lastName',
    description: 'User last name for search',
    required: false,
  })
  @ApiOkResponse({
    description: 'User list successfully retrieved.',
    type: [RegisterResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Access denied (admin role required).',
  })
  getUsers(
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
      limit: limit ?? 10,
    });
  }

  // * Редактирование профиля пользователя (First Name, Last Name), смена пароля, добавление аватара (PUT /users/profile)
  @Put('profile')
  @Roles('user', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update personal profile',
    description:
      'Available to authorized users. Allows updating first name, last name, password, or profile avatar.',
  })
  @ApiOkResponse({
    description: 'Profile successfully updated. Returns updated data.',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error of the submitted fields.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  editProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Формируем payload для отправки в RabbitMQ
    const payload: any = {
      userId: req.user.userId,
      firstName: body.firstName,
      lastName: body.lastName,
      password: body.password,
    };

    if (body.firstName) payload.firstName = body.firstName;
    if (body.lastName) payload.lastName = body.lastName;
    if (body.password) payload.password = body.password;

    // Если файл прикреплен, упаковываем его метаданные и буфер в сериализуемый формат
    // NestJS автоматически сериализует Buffer в формат { type: 'Buffer', data: [...] } при отправке в RMQ
    if (file) {
      payload.file = {
        originalname: file.originalname,
        buffer: file.buffer, 
      };
    }

    return this.authClient.send('user_edit_profile', payload);
  }

  // * Удаление аккаунта пользователя (DELETE /users/profile)
  @Delete('profile')
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete your own account',
    description:
      'Available to authorized users. Completely removes the profile of the current user from the system.',
  })
  @ApiResponse({
    status: 204,
    description: 'Account successfully deleted. Returns no content.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  deleteAccount(@Req() req: AuthenticatedRequest) {
    return this.authClient.send('user_delete_account', {
      userId: req.user.userId,
    });
  }
}
