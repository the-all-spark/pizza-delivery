import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  IUserRepository,
  PaginationOptions,
  SearchOptions,
} from '../interfaces/user-repository.interface';
import { User } from '../user.entity';
import { MongoUser } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    // Внедряем реальную модель Mongoose для работы с коллекцией документов
    @InjectModel(MongoUser.name)
    private readonly userModel: Model<MongoUser>,
  ) {}

  // 1. ПОЛУЧЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ С ПАГИНАЦИЕЙ
  async findAll(options: PaginationOptions): Promise<User[]> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    // Ищем документы, сортируем по убыванию даты создания, пропускаем и лимитируем
    const docs = await this.userModel
      .find()
      .sort({ createdAt: -1 }) // -1 означает DESC (по убыванию) в MongoDB
      .skip(skip)
      .limit(limit)
      .exec(); // возвращает полноценный Promise

    return docs as unknown as User[]; // Приводим к общему типу контракта User[]
  }

  // 2. ПОИСК ПОЛЬЗОВАТЕЛЕЙ ПО ИМЕНИ И/ИЛИ ФАМИЛИИ
  async findByNames(options: SearchOptions): Promise<User[]> {
    const { firstName, lastName } = options;
    const query: any = {};

    // Поиск по регулярному выражению (аналог LIKE в SQL). Флаг 'i' — без учета регистра
    if (firstName) {
      query.firstName = new RegExp(firstName, 'i');
    }
    if (lastName) {
      query.lastName = new RegExp(lastName, 'i');
    }

    const docs = await this.userModel
      .find(query)
      .sort({ firstName: 1, lastName: 1 }) // ASC (по возрастанию)
      .exec();

    return docs as unknown as User[];
  }

  // 3. ПОИСК ОДНОГО ПОЛЬЗОВАТЕЛЯ ПО ID
  async findById(id: number): Promise<User | null> {
    const doc = await this.userModel.findOne({ uId: id }).exec();
    return doc as unknown as User;
  }

  // 4. ОБНОВЛЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
  async update(id: number, data: Partial<User>): Promise<User> {
    // { new: true } возвращает измененный документ, а не старый
    const updatedDoc = await this.userModel
      .findOneAndUpdate({ uId: id }, { $set: data }, { new: true })
      .exec();

    if (!updatedDoc) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден в MongoDB`);
    }

    return updatedDoc as unknown as User;
  }

  // 5. УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ИЗ БАЗЫ
  async delete(id: number): Promise<boolean> {
    const result = await this.userModel.deleteOne({ uId: id }).exec();
    return result.deletedCount > 0;
  }
}
