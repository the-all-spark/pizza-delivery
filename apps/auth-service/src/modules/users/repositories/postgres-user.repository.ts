// Реализация для PostgreSQL

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

// Импортируем интерфейс-контракт и сущность
import {
  IUserRepository,
  PaginationOptions,
  SearchOptions,
} from '../interfaces/user-repository.interface';
import { User } from '../user.entity';

@Injectable()
export class PostgresUserRepository implements IUserRepository {
  constructor(
    // Внедряем стандартный репозиторий TypeORM для работы с таблицей PostgreSQL
    @InjectRepository(User)
    private readonly ormRepository: Repository<User>,
  ) {}

  // * 1. ПОЛУЧЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ С ПАГИНАЦИЕЙ
  async findAll(options: PaginationOptions): Promise<User[]> {
    const { page, limit } = options;

    // Вычисляем сколько строк в таблице нужно пропустить
    const skip = (page - 1) * limit;

    return await this.ormRepository.find({
      take: limit, // Лимит выборки
      skip: skip, // Смещение
      order: { createdAt: 'DESC' }, // Свежие пользователи будут вверху списка
    });
  }

  // * 2. ПОИСК ПОЛЬЗОВАТЕЛЕЙ ПО ИМЕНИ И/ИЛИ ФАМИЛИИ
  async findByNames(options: SearchOptions): Promise<User[]> {
    const { firstName, lastName } = options;

    // Динамически формируем условия выборки WHERE
    const whereConditions: any = {};

    // Используем оператор Like('%значение%') для поиска по частичному совпадению (без учета регистра на уровне БД)
    if (firstName) {
      whereConditions.firstName = Like(`%${firstName}%`);
    }
    if (lastName) {
      whereConditions.lastName = Like(`%${lastName}%`);
    }

    return await this.ormRepository.find({
      where: whereConditions,
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }

  // * 3. ПОИСК ОДНОГО ПОЛЬЗОВАТЕЛЯ ПО ID
  async findById(id: number): Promise<User | null> {
    // Ищем пользователя по первичному ключу uId
    return await this.ormRepository.findOne({ where: { uId: id } });
  }

  // * 4. ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
  async update(id: number, data: Partial<User>): Promise<User> {
    // Сначала проверяем, существует ли вообще такой пользователь
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    // Метод merge объединяет новые частичные данные (data) со старым объектом (user)
    const updatedUser = this.ormRepository.merge(user, data);

    // Сохраняем обновленную сущность обратно в PostgreSQL
    return await this.ormRepository.save(updatedUser);
  }

  // * 5. УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ БАЗЫ
  async delete(id: number): Promise<boolean> {
    // Выполняем физическое удаление строки из таблицы по uId
    const result = await this.ormRepository.delete(id);

    // Если количество затронутых строк (affected) больше 0, значит удаление прошло успешно
    return result.affected ? result.affected > 0 : false;
  }
}
