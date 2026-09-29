// * Сервис управления ингредиентами

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

import { Ingredient } from './ingredient.entity';
import { CreateIngredientPayload } from './ingredient-interfaces';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  // ==========================================
  // 1. ПОЛУЧИТЬ ВСЕ ИНГРЕДИЕНТЫ ПИЦЦЫ
  // ==========================================
  async findAll(): Promise<Ingredient[]> {
    return await this.ingredientRepository.find({
      order: { name: 'ASC' },
    });
  }

  // ==========================================
  // 2. ДОБАВИТЬ НОВЫЙ ИНГРЕДИЕНТ
  // ==========================================
  async create(data: CreateIngredientPayload): Promise<Ingredient> {
    const { name, price } = data;

    const existingIngredient = await this.ingredientRepository.findOne({
      where: { name },
    });

    if (existingIngredient) {
      throw new RpcException({
        statusCode: 409,
        message: `Ingredient named "${name}" already exists in the catalog.`,
      });
    }

    const newIngredient = this.ingredientRepository.create({ name, price });
    return await this.ingredientRepository.save(newIngredient);
  }

  // ==========================================
  // 3. ИЗМЕНИТЬ ИНГРЕДИЕНТ ПО ID
  // ==========================================
  async update(id: number, data: CreateIngredientPayload): Promise<Ingredient> {
    const { name, price } = data;

    const ingredient = await this.ingredientRepository.findOne({
      where: { ingrId: id },
    });

    if (!ingredient) {
      throw new RpcException({
        statusCode: 404,
        message: `Ingredient with ID ${id} not found in the catalog.`,
      });
    }

    const duplicateName = await this.ingredientRepository.findOne({
      where: { name },
    });

    if (duplicateName && duplicateName.ingrId !== id) {
      throw new RpcException({
        statusCode: 409,
        message: `Failed to update: name "${name}" is already in use by another ingredient.`,
      });
    }

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
    const ingredient = await this.ingredientRepository.findOne({
      where: { ingrId: id },
    });

    if (!ingredient) {
      throw new RpcException({
        statusCode: 404,
        message: `Ingredient with ID ${id} not found, deletion is not possible.`,
      });
    }
    
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
