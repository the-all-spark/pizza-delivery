// * Контроллер очередей микросервиса управления пользователями

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

import type { PaginationOptions, SearchOptions } from './interfaces/user-repository.interface';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // * 1. Получение списка всех пользователей с пагинацией (для админа)
  // Слушает команду 'admin_get_users' от API Gateway
  @MessagePattern('admin_get_users')
  async getAllUsers(@Payload() data: PaginationOptions) {
    // data содержит гарантированные шлюзом { page, limit }
    return await this.usersService.getAllUsers(data);
  }

  // * 2. Поиск пользователей по имени и/или фамилии (для админа)
  // Слушает команду 'user_search' от API Gateway
  @MessagePattern('user_search')
  async searchUsers(@Payload() data: SearchOptions) {
    // data содержит опциональные { firstName, lastName }
    return await this.usersService.searchUsers(data);
  }

  // * 3. Редактирование профиля текущего пользователя
  // Слушает команду 'user_edit_profile' от API Gateway
  @MessagePattern('user_edit_profile')
  async editProfile(
    @Payload()
    data: {
      userId: number;
      firstName?: string;
      lastName?: string;
      password?: string;
    },
  ) {
    const { userId, ...updateFields } = data;
    // Передаем отдельно ID и отдельно объект с полями для обновления
    return await this.usersService.editProfile(userId, updateFields);
  }

  // * 4. Удаление собственного аккаунта пользователем
  // Слушает команду 'user_delete_account' от API Gateway
  @MessagePattern('user_delete_account')
  async deleteAccount(@Payload() data: { userId: number }) {
    return await this.usersService.deleteAccount(data.userId);
  }
}
