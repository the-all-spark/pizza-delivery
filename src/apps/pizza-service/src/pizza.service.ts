import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs/promises';
import * as path from 'path';

import { Pizza, Ingredient } from '@shared/entities';

import { PizzaPaginationPayload, CreatePizzaPayload, UpdatePizzaPayload } from './pizza-interfaces';

@Injectable()
export class PizzaService {
  // встроенный локальный логгер Nestjs (выводит текстовый лог в терминал Docker-контейнера)
  private readonly logger = new Logger(PizzaService.name);

  constructor(
    @InjectRepository(Pizza)
    private readonly pizzaRepository: Repository<Pizza>,

    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  // ==========================================
  // 1. ПОЛУЧИТЬ ПОСТРАНИЧНЫЙ СПИСОК ПИЦЦ
  // ==========================================
  async findPaginated(payload: PizzaPaginationPayload): Promise<any> {
    const { page, limit } = payload;
    const skip = (page - 1) * limit;

    const [pizzas, total] = await this.pizzaRepository.findAndCount({
      take: limit,
      skip: skip,
      relations: {
        ingredients: true,
      },
      order: { createdAt: 'DESC' },
    });

    const formattedPizzas = pizzas.map((pizza) => {
      pizza.price = Number(pizza.price);

      if (pizza.ingredients) {
        pizza.ingredients = pizza.ingredients.map((ingr) => {
          ingr.price = Number(ingr.price);
          return ingr;
        });
      }
      return pizza;
    });

    return {
      data: formattedPizzas,
      total,
      page,
      limit,
    };
  }

  // ==========================================
  // 2. ПОЛУЧИТЬ ДЕТАЛИ ПИЦЦЫ ПО ID С ИНГРЕДИЕНТАМИ
  // ==========================================
  async findDetailById(id: number): Promise<Pizza> {
    const pizza = await this.pizzaRepository.findOne({
      where: { pId: id },
      relations: {
        ingredients: true,
      },
    });

    if (!pizza) {
      throw new RpcException({
        statusCode: 404,
        message: `Pizza with ID ${id} was not found on the menu.`,
      });
    }

    return pizza;
  }

  // ==========================================
  // 3. СОЗДАТЬ ПИЦЦУ (С МАССИВОМ ИНГРЕДИЕНТОВ)
  // ==========================================
  async create(payload: CreatePizzaPayload): Promise<Pizza> {
    const { title, description, price, imageUrl, ingredients } = payload;

    const existingPizza = await this.pizzaRepository.findOne({ where: { title } });
    if (existingPizza) {
      throw new RpcException({
        statusCode: 409,
        message: `Pizza with the title "${title}" already exists in the menu.`,
      });
    }

    if (!ingredients || ingredients.length === 0) {
      throw new RpcException({
        statusCode: 400,
        message: 'Cannot create a pizza without specifying an array of ingredients.',
      });
    }

    const foundIngredients = await this.ingredientRepository.find({
      where: { ingrId: In(ingredients) },
    });

    if (foundIngredients.length !== ingredients.length) {
      throw new RpcException({
        statusCode: 400,
        message: 'One or more of the specified ingredient IDs do not exist in the system.',
      });
    }

    const newPizza = this.pizzaRepository.create({
      title,
      description,
      price,
      imageUrl,
      ingredients: foundIngredients,
    });

    // Сохраняем пиццу, TypeORM сам автоматически заполнит промежуточную таблицу pizza_ingredients
    return await this.pizzaRepository.save(newPizza);
  }

  // ==========================================
  // 4. РЕДАКТИРОВАТЬ ПАРАМЕТРЫ ПИЦЦЫ
  // ==========================================
  async update(payload: UpdatePizzaPayload): Promise<Pizza> {
    const { pizzaId, title, description, price, imageUrl } = payload;

    const pizza = await this.findDetailById(pizzaId);

    const updateFields: Partial<Pizza> = {};

    if (title) {
      const duplicate = await this.pizzaRepository.findOne({ where: { title } });
      if (duplicate && duplicate.pId !== pizzaId) {
        throw new RpcException({
          statusCode: 409,
          message: `Pizza with the title "${title}" already exists in the menu.`,
        });
      }
      updateFields.title = title;
    }

    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = price;
    if (imageUrl) updateFields.imageUrl = imageUrl;

    const updated = this.pizzaRepository.merge(pizza, updateFields);
    return await this.pizzaRepository.save(updated);
  }

  // ==========================================
  // 5. ДОБАВИТЬ ИНГРЕДИЕНТ К ПИЦЦЕ (ManyToMany)
  // ==========================================
  async addIngredient(pizzaId: number, ingredientId: number): Promise<Pizza> {
    const pizza = await this.findDetailById(pizzaId);

    const ingredient = await this.ingredientRepository.findOne({ where: { ingrId: ingredientId } });
    if (!ingredient) {
      throw new RpcException({
        statusCode: 404,
        message: `Ingredient with ID ${ingredientId} not found in the catalog.`,
      });
    }

    const alreadyExists = pizza.ingredients.some((ing) => ing.ingrId === ingredientId);
    if (alreadyExists) {
      throw new RpcException({
        statusCode: 400,
        message: 'This ingredient is already linked to this pizza.',
      });
    }
    pizza.ingredients.push(ingredient);

    return await this.pizzaRepository.save(pizza);
  }

  // ==========================================
  // 6. УДАЛИТЬ ИНГРЕДИЕНТ ИЗ ПИЦЦЫ (ManyToMany)
  // ==========================================
  async removeIngredient(pizzaId: number, ingredientId: number): Promise<Pizza> {
    const pizza = await this.findDetailById(pizzaId);

    const index = pizza.ingredients.findIndex((ing) => ing.ingrId === ingredientId);
    if (index === -1) {
      throw new RpcException({
        statusCode: 404,
        message: 'The specified ingredient was not found in the recipe of this pizza.',
      });
    }
    pizza.ingredients.splice(index, 1);

    return await this.pizzaRepository.save(pizza);
  }

  // ==========================================
  // 7. МЕХАНИЗМ ТРАНЗАКЦИЙ: УДАЛЕНИЕ ПИЦЦЫ И ФАЙЛА КАРТИНКИ
  // ==========================================
  async deletePizza(pizzaId: number): Promise<{ success: boolean }> {
    const pizza = await this.findDetailById(pizzaId);

    const queryRunner = this.pizzaRepository.manager.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Pizza, pizzaId);

      // Пытаемся физически удалить файл изображения с диска
      if (pizza.imageUrl) {
        const filename = path.basename(pizza.imageUrl);
        const absolutePath = path.join(process.cwd(), 'uploads', 'pizzas', filename);

        try {
          await fs.access(absolutePath);
          await fs.unlink(absolutePath);
          this.logger.log(`✅ Файл ${filename} успешно удален с диска.`);
        } catch {
          this.logger.warn(
            `Файл ${filename} не найден по пути ${absolutePath}. Продолжаем очистку БД...`,
          );
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`🗑️ Пицца "${pizza.title}" и её изображение успешно удалены из системы.`);

      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        `❌ Ошибка удаления пиццы с ID ${pizzaId}. Транзакция откатана.`,
        errorMessage,
      );

      throw new RpcException({
        statusCode: 500,
        message: 'Failed to delete pizza. File system error, changes rolled back.',
      });
    } finally {
      // Освобождаем QueryRunner во избежание утечки соединений в пуле PostgreSQL
      await queryRunner.release();
    }
  }

  // ==========================================
  // 8. КРОН-ЗАДАЧА: АВТОМАТИЧЕСКАЯ ОЧИСТКА СТАРЫХ ПИЦЦ
  // ==========================================

  // Крон запускается каждый день в полночь
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutomaticPizzaCleanup() {
    this.logger.log('⏰ Запущен плановый Крон-аудит каталога меню пицц...');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const oldPizzas = await this.pizzaRepository
      .createQueryBuilder('pizza')
      .where('pizza.lastOrderedAt < :date', { date: sixMonthsAgo })
      .orWhere('pizza.createdAt < :date AND pizza.lastOrderedAt IS NULL', { date: sixMonthsAgo })
      .getMany();

    if (oldPizzas.length === 0) {
      this.logger.log('✅ Устаревших пицц, не заказывавшихся более 6 месяцев, не обнаружено.');
      return;
    }

    this.logger.warn(
      `⚠️ Обнаружено ${oldPizzas.length} невостребованных пицц. Начинаем автоудаление...`,
    );

    for (const oldPizza of oldPizzas) {
      try {
        await this.deletePizza(oldPizza.pId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error);
        this.logger.error(
          `❌ Не удалось автоматически удалить старую пиццу с ID ${oldPizza.pId}`,
          errorMessage,
        );
      }
    }
  }
}
