import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  IUserRepository,
  PaginationOptions,
  SearchOptions,
} from '../interfaces/user-repository.interface';
import { User } from '@shared/entities';
import { MongoUser } from '../../users/schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(MongoUser.name)
    private readonly userModel: Model<MongoUser>,
  ) {}

  async findAll(options: PaginationOptions): Promise<User[]> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const docs = await this.userModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();

    return docs as unknown as User[];
  }

  async findByNames(options: SearchOptions): Promise<User[]> {
    const { firstName, lastName } = options;
    const query: any = {};

    if (firstName) {
      query.firstName = new RegExp(firstName, 'i');
    }
    if (lastName) {
      query.lastName = new RegExp(lastName, 'i');
    }

    const docs = await this.userModel.find(query).sort({ firstName: 1, lastName: 1 }).exec();

    return docs as unknown as User[];
  }

  async findById(id: number): Promise<User | null> {
    const doc = await this.userModel.findOne({ uId: id }).exec();
    return doc as unknown as User;
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const updatedDoc = await this.userModel
      .findOneAndUpdate({ uId: id }, { $set: data }, { new: true })
      .exec();

    if (!updatedDoc) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден в MongoDB`);
    }

    return updatedDoc as unknown as User;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userModel.deleteOne({ uId: id }).exec();
    return result.deletedCount > 0;
  }
}
