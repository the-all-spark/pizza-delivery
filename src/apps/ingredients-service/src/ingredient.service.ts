// Сервис управления ингредиентами
/* методы выборки, создания с проверкой на дубликат названия, 
обновления и удаления сущностей с пробросом RpcException */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

import { Ingredient } from './ingredient.entity';
import { CreateIngredientPayload } from './ingredients-interfaces';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    // внедряем стандартный Repository<Ingredient> от TypeORM
    // для прямого взаимодействия с таблицей ingredients в PostgreSQL
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  // ==========================================
  // 1. ПОЛУЧИТЬ ВСЕ ИНГРЕДИЕНТЫ ПИЦЦЫ
  // ==========================================
  async findAll(): Promise<Ingredient[]> {
    return await this.ingredientRepository.find({
      order: { name: 'ASC' }, // Сортируем по алфавиту для удобства админа
    });
  }

  // ==========================================
  // 2. ДОБАВИТЬ НОВЫЙ ИНГРЕДИЕНТ
  // ==========================================
  async create(data: CreateIngredientPayload): Promise<Ingredient> {
    const { name, price } = data;

    // Проверяем, существует ли уже ингредиент с таким именем
    const existingIngredient = await this.ingredientRepository.findOne({
      where: { name },
    });

    if (existingIngredient) {
      // Бросаем 409 Conflict, который шлюз превратит в HTTP-ошибку
      throw new RpcException({
        statusCode: 409,
        message: `Ingredient named "${name}" already exists in the catalog.`,
      });
    }

    // Создаем экземпляр сущности и сохраняем его в PostgreSQL
    const newIngredient = this.ingredientRepository.create({ name, price });
    return await this.ingredientRepository.save(newIngredient);
  }

  // ==========================================
  // 3. ИЗМЕНИТЬ ИНГРЕДИЕНТ ПО ID
  // ==========================================
  async update(id: number, data: CreateIngredientPayload): Promise<Ingredient> {
    const { name, price } = data;

    // 1. Ищем ингредиент, чтобы убедиться в его существовании
    const ingredient = await this.ingredientRepository.findOne({
      where: { ingrId: id },
    });

    if (!ingredient) {
      throw new RpcException({
        statusCode: 404,
        message: `Ingredient with ID ${id} not found in the catalog.`,
      });
    }

    // 2. Проверяем, не занято ли новое имя другим ингредиентом
    const duplicateName = await this.ingredientRepository.findOne({
      where: { name },
    });

    // Если ингредиент с таким именем есть, и это НЕ тот ингредиент, который мы сейчас редактируем
    if (duplicateName && duplicateName.ingrId !== id) {
      throw new RpcException({
        statusCode: 409,
        message: `Failed to update: name "${name}" is already in use by another ingredient.`,
      });
    }

    // Объединяем измененные поля и сохраняем обновленную сущность
    const updatedIngredient = this.ingredientRepository.merge(ingredient, {
      name,
      price,
    });
    return await this.ingredientRepository.save(updatedIngredient);
  }

  // ==========================================
  // 4. УДАЛИТЬ ИНГРЕДИЕНТ ПО ID
  // ==========================================
  async delete(id: number): Promise<{ success: boolean }> {
    // Проверяем наличие перед удалением
    const ingredient = await this.ingredientRepository.findOne({
      where: { ingrId: id },
    });

    if (!ingredient) {
      throw new RpcException({
        statusCode: 404,
        message: `Ingredient with ID ${id} not found, deletion is not possible.`,
      });
    }

    // Выполняем физическое удаление строки из PostgreSQL
    await this.ingredientRepository.delete(id);
    return { success: true };
  }

  // ==========================================
  // 5. ПОЛУЧИТЬ ИНГРЕДИЕНТ ПО ID
  // ==========================================
  async findById(id: number): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { ingrId: id },
    });

    if (!ingredient) {
      throw new RpcException({
        statusCode: 404,
        message: `Ingredient with ID ${id} not found in the catalog.`,
      });
    }

    return ingredient;
  }
}
