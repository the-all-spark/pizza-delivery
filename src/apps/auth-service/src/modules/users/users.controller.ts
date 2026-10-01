// * Контроллер очередей микросервиса управления пользователями

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

import type {
  PaginationOptions,
  SearchOptions,
  EditProfilePayload,
} from './interfaces/user-repository.interface';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('admin_get_users')
  async getAllUsers(@Payload() data: PaginationOptions) {
    return await this.usersService.getAllUsers(data);
  }

  @MessagePattern('user_search')
  async searchUsers(@Payload() data: SearchOptions) {
    return await this.usersService.searchUsers(data);
  }

  @MessagePattern('user_edit_profile')
  async editProfile(
    @Payload()
    data: EditProfilePayload,
  ) {
    const { userId, ...updateFields } = data;
    return await this.usersService.editProfile(userId, updateFields);
  }

  @MessagePattern('user_delete_account')
  async deleteAccount(@Payload() data: { userId: number }) {
    return await this.usersService.deleteAccount(data.userId);
  }
}
