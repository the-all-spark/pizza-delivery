// * Сервис управления пользователями (бизнес-логика)
// применяем паттерн Dependency Injection, внедрив абстрактный класс IUserRepository

import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

import {
  IUserRepository,
  PaginationOptions,
  SearchOptions,
} from './interfaces/user-repository.interface';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: IUserRepository,

    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  // ==========================================
  // 1. ПОЛУЧЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ С ПАГИНАЦИЕЙ
  // ==========================================
  async getAllUsers(options: PaginationOptions): Promise<Partial<User>[]> {
    const users = await this.userRepository.findAll(options);

    return users.map((user) => {
      const { passwordHash: _, ...result } = user;
      return result;
    });
  }

  // ==========================================
  // 2. ПОИСК ПОЛЬЗОВАТЕЛЕЙ ПО ИМЕНИ / ФАМИЛИИ
  // ==========================================
  async searchUsers(options: SearchOptions): Promise<Partial<User>[]> {
    const users = await this.userRepository.findByNames(options);

    return users.map((user) => {
      const { passwordHash: _, ...result } = user;
      return result;
    });
  }

  // ==========================================
  // 3. РЕДАКТИРОВАНИЕ ПРОФИЛЯ И СМЕНА ПАРОЛЯ
  // ==========================================
  async editProfile(
    userId: number,
    updateData: { firstName?: string; lastName?: string; password?: string },
  ): Promise<Partial<User>> {
    const { firstName, lastName, password } = updateData;
    const fieldsToUpdate: Partial<User> = {};

    if (firstName) fieldsToUpdate.firstName = firstName;
    if (lastName) fieldsToUpdate.lastName = lastName;

    if (password) {
      const saltRounds = 10;
      fieldsToUpdate.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await this.userRepository.update(userId, fieldsToUpdate);

    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }

  // ==========================================
  // 4. УДАЛЕНИЕ СОБСТВЕННОГО АККАУНТА
  // ==========================================
  async deleteAccount(userId: number): Promise<{ success: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: `User with ID ${userId} was not found in the system.`,
      });
    }

    const isDeleted = await this.userRepository.delete(userId);

    if (!isDeleted) {
      throw new RpcException({
        statusCode: 500,
        message: 'Failed to delete the account due to an internal DBMS error.',
      });
    }

    this.notificationClient.emit('user_deleted_event', {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return { success: true };
  }
}
