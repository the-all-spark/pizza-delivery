// Абстракция для смены БД

import { User } from '@shared/entities';

// Структура параметров для пагинации
export interface PaginationOptions {
  page: number;
  limit: number;
}

// Структура параметров для поиска по имени/фамилии
export interface SearchOptions {
  firstName?: string;
  lastName?: string;
}

export abstract class IUserRepository {
  /**
   * Получить список всех пользователей с пагинацией
   * @param options Объект с номером страницы и лимитом элементов
   */
  abstract findAll(options: PaginationOptions): Promise<User[]>;

  /**
   * Поиск пользователей по имени и/или фамилии
   * @param options Объект с опциональными firstName и lastName
   */
  abstract findByNames(options: SearchOptions): Promise<User[]>;

  /**
   * Поиск одного пользователя по ID (нужен перед обновлением или удалением для проверки)
   * @param id Уникальный числовой ID пользователя (uId)
   */
  abstract findById(id: number): Promise<User | null>;

  /**
   * Обновление данных пользователя (имя, фамилия, хэш пароля)
   * @param id ID пользователя
   * @param data Объект с частичными полями сущности User для обновления
   */
  abstract update(id: number, data: Partial<User>): Promise<User>;

  /**
   * Удаление пользователя из базы данных
   * @param id ID пользователя
   */
  abstract delete(id: number): Promise<boolean>;

  /**
   * Метод создания пользователя (опционально, на случай переноса регистрации в этот модуль)
   * @param data Поля для создания новой сущности
   */
  // abstract create(data: Partial<User>): Promise<User>;
}
