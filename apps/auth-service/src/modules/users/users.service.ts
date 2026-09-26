// * Сервис управления пользователями (бизнес-логика)
/**
 * применяем паттерн Dependency Injection, внедрив абстрактный класс IUserRepository.
 * Наш сервис не будет знать, какая конкретно БД сейчас подключена
 */

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
    // Внедряем СТРОГО через абстрактный класс-интерфейс
    private readonly userRepository: IUserRepository,

    // Внедряем клиент RabbitMQ для отправки событий в notification-service.
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  // ==========================================
  // 1. ПОЛУЧЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ С ПАГИНАЦИЕЙ
  // ==========================================
  async getAllUsers(options: PaginationOptions): Promise<Partial<User>[]> {
    const users = await this.userRepository.findAll(options);

    // Безопасность: отрезаем хэш пароля у каждого пользователя в списке
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

    // Безопасность: отрезаем хэш пароля
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

    // Заполняем только те поля, которые пришли от шлюза
    if (firstName) fieldsToUpdate.firstName = firstName;
    if (lastName) fieldsToUpdate.lastName = lastName;

    // Если пользователь передал новый пароль — хэшируем его через bcrypt
    if (password) {
      const saltRounds = 10;
      fieldsToUpdate.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // Вызываем метод обновления репозитория
    const updatedUser = await this.userRepository.update(userId, fieldsToUpdate);

    // Возвращаем результат без хэша пароля
    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }

  // ==========================================
  // 4. УДАЛЕНИЕ СОБСТВЕННОГО АККАУНТА
  // ==========================================
  async deleteAccount(userId: number): Promise<{ success: boolean }> {
    // 1. Сначала ищем пользователя, чтобы получить его Email перед удалением
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new RpcException({
        statusCode: 404,
        message: `User with ID ${userId} was not found in the system.`,
      });
    }

    // 2. Вызываем физическое удаление из базы данных
    const isDeleted = await this.userRepository.delete(userId);

    if (!isDeleted) {
      throw new RpcException({
        statusCode: 500,
        message: 'Failed to delete the account due to an internal DBMS error.',
      });
    }

    // 3. Отправляем событие (emit) в RabbitMQ для notification-service.
    // Используем метод emit, а не send, потому что нам не нужно ждать ответа от почтового сервиса
    this.notificationClient.emit('user_deleted_event', {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return { success: true };
  }
}
