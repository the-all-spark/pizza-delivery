import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import {
  IUserRepository,
  PaginationOptions,
  SearchOptions,
} from '../interfaces/user-repository.interface';
import { User } from '@shared/entities';

@Injectable()
export class PostgresUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly ormRepository: Repository<User>,
  ) {}

  async findAll(options: PaginationOptions): Promise<User[]> {
    const { page, limit } = options;

    const skip = (page - 1) * limit;

    return await this.ormRepository.find({
      take: limit,
      skip: skip,
      order: { createdAt: 'DESC' },
    });
  }

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

  async findById(id: number): Promise<User | null> {
    return await this.ormRepository.findOne({ where: { uId: id } });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    const updatedUser = this.ormRepository.merge(user, data);

    return await this.ormRepository.save(updatedUser);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.ormRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
