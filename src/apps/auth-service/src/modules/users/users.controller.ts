// * Контроллер очередей микросервиса управления пользователями

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

import type { PaginationOptions, SearchOptions } from './interfaces/user-repository.interface';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // * Получение списка всех пользователей с пагинацией (для админа)
  @MessagePattern('admin_get_users')
  async getAllUsers(@Payload() data: PaginationOptions) {
    return await this.usersService.getAllUsers(data);
  }

  // * Поиск пользователей по имени и/или фамилии (для админа)
  @MessagePattern('user_search')
  async searchUsers(@Payload() data: SearchOptions) {
    return await this.usersService.searchUsers(data);
  }

  // * Редактирование профиля текущего пользователя
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
    return await this.usersService.editProfile(userId, updateFields);
  }

  // * Удаление собственного аккаунта пользователем
  @MessagePattern('user_delete_account')
  async deleteAccount(@Payload() data: { userId: number }) {
    return await this.usersService.deleteAccount(data.userId);
  }
}
