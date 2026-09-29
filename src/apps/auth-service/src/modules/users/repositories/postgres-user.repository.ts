// Реализация для PostgreSQL

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

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

  // * Получение всех пользователей с пагинацией
  async findAll(options: PaginationOptions): Promise<User[]> {
    const { page, limit } = options;

    const skip = (page - 1) * limit;

    return await this.ormRepository.find({
      take: limit,
      skip: skip,
      order: { createdAt: 'DESC' },
    });
  }

  // * Поиск пользователей по имени и/или фамилии
  async findByNames(options: SearchOptions): Promise<User[]> {
    const { firstName, lastName } = options;

    const whereConditions: any = {};
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

  // * Поиск одного пользователя по его id
  async findById(id: number): Promise<User | null> {
    return await this.ormRepository.findOne({ where: { uId: id } });
  }

  // * Обновление данных пользователя
  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    const updatedUser = this.ormRepository.merge(user, data);

    return await this.ormRepository.save(updatedUser);
  }

  // * Удаление пользователя из базы
  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
