import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule'; // Понадобится для Крона во 2-й части
import * as fs from 'fs/promises'; // Понадобится для работы с файлами во 2-й части
import * as path from 'path';

// Импортируем сущности
import { Pizza } from './pizza.entity';
import { Ingredient } from '../ingredients/ingredient.entity';

// Импортируем наши интерфейсы
import { 
  PizzaPaginationPayload, 
  CreatePizzaPayload, 
  UpdatePizzaPayload 
} from './pizza-interfaces';

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
  async findPaginated(payload: PizzaPaginationPayload): Promise<Pizza[]> { //!
    const { page, limit } = payload;
    const skip = (page - 1) * limit;

    // возвращаем пиццы БЕЗ детального списка ингредиентов
    return await this.pizzaRepository.find({
      take: limit,
      skip: skip,
      order: { createdAt: 'DESC' },
    });
  }

  // ==========================================
  // 2. ПОЛУЧИТЬ ДЕТАЛИ ПИЦЦЫ ПО ID С ИНГРЕДИЕНТАМИ
  // ==========================================
  async findDetailById(id: number): Promise<Pizza> {
    const pizza = await this.pizzaRepository.findOne({
      where: { pId: id },
      relations: {
        ingredients: true, // Говорим TypeORM: "Подтяни связь с именем ingredients"
      },
    });

    if (!pizza) {
      throw new RpcException({
        statusCode: 404,
        message: `Пицца с ID ${id} не найдена в меню.`,
      });
    }

    return pizza;
  }

  // ==========================================
  // 3. СОЗДАТЬ ПИЦЦУ (С МАССИВОМ ИНГРЕДИЕНТОВ)
  // ==========================================
  async create(payload: CreatePizzaPayload): Promise<Pizza> {
    const { title, description, price, imageUrl, ingredients } = payload;

    // 1. Проверяем, нет ли в меню пиццы с таким же названием
    const existingPizza = await this.pizzaRepository.findOne({ where: { title } });
    if (existingPizza) {
      throw new RpcException({
        statusCode: 409,
        message: `Пицца с названием "${title}" уже существует в меню.`,
      });
    }

    // 2. Проверяем, переданы ли ингредиенты
    if (!ingredients || ingredients.length === 0) {
      throw new RpcException({
        statusCode: 400,
        message: 'Невозможно создать пиццу без указания массива ингредиентов.',
      });
    }

    // 3. Ищем переданные числовые ID в таблице ingredients СУБД PostgreSQL
    const foundIngredients = await this.ingredientRepository.find({
      where: { ingrId: In(ingredients) },
    });

    // Если база нашла меньше ингредиентов, чем запросил админ — значит, какой-то ID не существует
    if (foundIngredients.length !== ingredients.length) {
      throw new RpcException({
        statusCode: 400,
        message: 'Один или несколько указанных ID ингредиентов не существуют в системе.',
      });
    }

    // 4. Создаем сущность пиццы и связываем её с найденными сущностями ингредиентов
    const newPizza = this.pizzaRepository.create({
      title,
      description,
      price,
      imageUrl,
      ingredients: foundIngredients, // Передаем полноценные объекты ManyToMany
    });

    // Сохраняем пиццу, TypeORM сам автоматически заполнит промежуточную таблицу pizza_ingredients
    return await this.pizzaRepository.save(newPizza);
  }

  // ==========================================
  // 4. РЕДАКТИРОВАТЬ ПАРАМЕТРЫ ПИЦЦЫ
  // ==========================================
  async update(payload: UpdatePizzaPayload): Promise<Pizza> {
    const { pizzaId, title, description, price, imageUrl } = payload;

    // Проверяем существование пиццы
    const pizza = await this.findDetailById(pizzaId);

    const updateFields: Partial<Pizza> = {};

    if (title) {
      // Проверяем, не занято ли новое название другой пиццей
      const duplicate = await this.pizzaRepository.findOne({ where: { title } });
      if (duplicate && duplicate.pId !== pizzaId) {
        throw new RpcException({
          statusCode: 409,
          message: `Пицца с названием "${title}" уже существует в меню.`,
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
    // Получаем пиццу вместе с её текущими ингредиентами
    const pizza = await this.findDetailById(pizzaId);

    // Проверяем, существует ли вообще такой ингредиент в PostgreSQL
    const ingredient = await this.ingredientRepository.findOne({ where: { ingrId: ingredientId } });
    if (!ingredient) {
      throw new RpcException({
        statusCode: 404,
        message: `Ингредиент с ID ${ingredientId} не найден в каталоге.`,
      });
    }

    // Проверяем, не добавлен ли этот ингредиент в пиццу уже сейчас
    const alreadyExists = pizza.ingredients.some(ing => ing.ingrId === ingredientId);
    if (alreadyExists) {
      throw new RpcException({
        statusCode: 400,
        message: 'Этот ингредиент уже привязан к данной пицце.',
      });
    }

    // Добавляем новый ингредиент в массив связей сущности
    pizza.ingredients.push(ingredient);
    
    // Сохраняем пиццу — TypeORM сам добавит строчку в промежуточную таблицу pizza_ingredients
    return await this.pizzaRepository.save(pizza);
  }

  // ==========================================
  // 6. УДАЛИТЬ ИНГРЕДИЕНТ ИЗ ПИЦЦЫ (ManyToMany)
  // ==========================================
  async removeIngredient(pizzaId: number, ingredientId: number): Promise<Pizza> {
    const pizza = await this.findDetailById(pizzaId);

    // Ищем индекс ингредиента в текущем массиве связей пиццы
    const index = pizza.ingredients.findIndex(ing => ing.ingrId === ingredientId);
    if (index === -1) {
      throw new RpcException({
        statusCode: 404,
        message: 'Указанный ингредиент не найден в рецепте этой пиццы.',
      });
    }

    // Удаляем ингредиент из массива связей сущности
    pizza.ingredients.splice(index, 1);
    
    // Сохраняем пиццу — TypeORM сам удалит строчку из таблицы pizza_ingredients
    return await this.pizzaRepository.save(pizza);
  }

  // ==========================================
  // 7. МЕХАНИЗМ ТРАНЗАКЦИЙ: УДАЛЕНИЕ ПИЦЦЫ И ФАЙЛА КАРТИНКИ
  // ==========================================
  async deletePizza(pizzaId: number): Promise<{ success: boolean }> {
    const pizza = await this.findDetailById(pizzaId);

    // Для управления транзакцией вручную создаем QueryRunner
    const queryRunner = this.pizzaRepository.manager.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(); // Стартуем транзакцию СУБД

    try {
      // Шаг A: Удаляем пиццу из базы через queryRunner.
      // Благодаря onDelete: 'CASCADE' в Entity, промежуточная таблица очистится автоматически
      await queryRunner.manager.delete(Pizza, pizzaId);

      // Шаг B: Пытаемся физически удалить файл изображения с диска
      if (pizza.imageUrl) {
        // Вычисляем абсолютный путь к картинке на сервере 
        // (файлы лежат в папке: apps/pizza-service/uploads/имя_файла)
        const filename = path.basename(pizza.imageUrl);
        const absolutePath = path.join(process.cwd(), 'apps', 'pizza-service', 'uploads', filename);

        // Проверяем существование файла, чтобы не падать на системной ошибке Node.js
        await fs.access(absolutePath);
        // Стираем файл с диска
        await fs.unlink(absolutePath);
      }

      // Если база успешно очищена и файл стерт — фиксируем транзакцию
      await queryRunner.commitTransaction();
      this.logger.log(`🗑️ Пицца "${pizza.title}" и её изображение успешно удалены из системы.`);
      return { success: true };

    } catch (error) {
      // Если что-то пошло не так (например, ошибка fs при удалении файла) — делаем откат
      await queryRunner.rollbackTransaction();
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(`❌ Ошибка удаления пиццы с ID ${pizzaId}. Транзакция откатана.`, errorMessage);

      throw new RpcException({
        statusCode: 500,
        message: 'Не удалось удалить пиццу. Ошибка файловой системы, изменения отменены.',
      });
    } finally {
      // Обязательно освобождаем QueryRunner во избежание утечки соединений в пуле PostgreSQL
      await queryRunner.release();
    }
  }

  // ==========================================
  // 8. КРОН-ЗАДАЧА: АВТОМАТИЧЕСКАЯ ОЧИСТКА СТАРЫХ ПИЦЦ
  // ==========================================
  // Крон запускается каждый день в полночь: CronExpression.EVERY_DAY_AT_MIDNIGHT
  // Для тестирования можно поставить CronExpression.EVERY_MINUTE (каждую минуту)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutomaticPizzaCleanup() {
    this.logger.log('⏰ Запущен плановый Крон-аудит каталога меню пицц...');

    // Вычисляем временную отметку "6 месяцев назад" относительно текущей даты //!
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Находим все пиццы, которые не заказывались более 6 месяцев 
    // (lastOrderedAt старше шести месяцев ИЛИ пицца старая, но её вообще ни разу не заказывали)
    const oldPizzas = await this.pizzaRepository.createQueryBuilder('pizza')
      .where('pizza.lastOrderedAt < :date', { date: sixMonthsAgo })
      .orWhere('pizza.createdAt < :date AND pizza.lastOrderedAt IS NULL', { date: sixMonthsAgo })
      .getMany();

    if (oldPizzas.length === 0) {
      this.logger.log('✓ Устаревших пицц, не заказывавшихся более 6 месяцев, не обнаружено.');
      return;
    }

    this.logger.warn(`⚠ Обнаружено ${oldPizzas.length} невостребованных пицц. Начинаем автоудаление...`);

    // Перебираем и удаляем каждую старую пиццу через наш безопасный транзакционный метод удаления
    for (const oldPizza of oldPizzas) {
      try {
        await this.deletePizza(oldPizza.pId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.stack : String(error);
        this.logger.error(`❌ Не удалось автоматически удалить старую пиццу с ID ${oldPizza.pId}`, errorMessage);
      }
    }
  }
} 