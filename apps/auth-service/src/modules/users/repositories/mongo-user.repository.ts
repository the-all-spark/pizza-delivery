// Реализация для MongoDB

import { Injectable } from '@nestjs/common';
import {
  IUserRepository,
  PaginationOptions,
  SearchOptions,
} from '../interfaces/user-repository.interface';
import { User } from '../user.entity';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  // 1. ПОЛУЧЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (ЗАГЛУШКА)
  async findAll(options: PaginationOptions): Promise<User[]> {
    throw new Error(
      'Реализация MongoDB для метода findAll еще не активна в системе.',
    );
  }

  // 2. ПОИСК ПОЛЬЗОВАТЕЛЕЙ ПО ИМЕНИ/ФАМИЛИИ (ЗАГЛУШКА)
  async findByNames(options: SearchOptions): Promise<User[]> {
    throw new Error(
      'Реализация MongoDB для метода findByNames еще не активна в системе.',
    );
  }

  // 3. ПОИСК ОДНОГО ПОЛЬЗОВАТЕЛЯ ПО ID (ЗАГЛУШКА)
  async findById(id: number): Promise<User | null> {
    throw new Error('Реализация MongoDB для метода findById еще не active.');
  }

  // 4. ОБНОВЛЕНИЕ ДАННЫХ (ЗАГЛУШКА)
  async update(id: number, data: Partial<User>): Promise<User> {
    throw new Error(
      'Реализация MongoDB для метода update еще не активна в системе.',
    );
  }

  // 5. УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ (ЗАГЛУШКА)
  async delete(id: number): Promise<boolean> {
    throw new Error(
      'Реализация MongoDB для метода delete еще не активна в системе.',
    );
  }
}
