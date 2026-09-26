// Генерация тестовых данных БД

import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Импортируем сущности
import { User } from '../../../../auth-service/src/modules/users/user.entity';
import { Pizza } from '../pizzas/pizza.entity';
import { PromoCode } from '../promo-codes/promo-code.entity';
import { Ingredient } from '../ingredients/ingredient.entity';
import { UserRole } from '@shared/enums';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Pizza)
    private readonly pizzaRepository: Repository<Pizza>,
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  // Этот метод NestJS вызывает автоматически, когда всё приложение успешно запустилось
  async onApplicationBootstrap() {
    console.log('--- Проверка базы данных для сиддинга ---');
    await this.seed();
  }

  private async seed() {
    // 1. Проверяем, есть ли уже пользователи в базе данных
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      console.log('База данных уже содержит данные. Сиддинг пропущен.');
      return;
    }

    console.log('База пуста. Начинаем наполнение тестовыми данными...');

    // 2. Создаем пользователей (Администратор и Пользователь) с хэшированием паролей
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
    const userPasswordHash = await bcrypt.hash('user123', saltRounds);

    const adminUser = this.userRepository.create({
      email: 'admin@pizza.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      firstName: 'Анна',
      lastName: 'Герман',
    } as DeepPartial<User>);

    const regularUser = this.userRepository.create({
      email: 'user@pizza.com',
      passwordHash: userPasswordHash,
      role: UserRole.USER,
      firstName: 'Юрий',
      lastName: 'Петров',
    } as DeepPartial<User>);

    await this.userRepository.save([adminUser, regularUser]);

    console.log('✅ Тестовые пользователи успешно созданы.');

    // 3. Создаем ингредиенты
    const ingredientData = [
      { name: 'Сыр Моцарелла', price: 2.5 },
      { name: 'Пепперони', price: 2 },
      { name: 'Томаты', price: 3 },
      { name: 'Грибы', price: 2.4 },
      { name: 'Огурчики маринованные', price: 1.5 },
      { name: 'Ветчина', price: 4 },
      { name: 'Куриное филе', price: 5 },
      { name: 'Ананасы', price: 4.5 },
      { name: 'Соус Томатный', price: 1.5 },
      { name: 'Соус Барбекю', price: 1.6 },
    ];

    const savedIngredients = await this.ingredientRepository.save(
      this.ingredientRepository.create(ingredientData),
    );
    console.log('✅ Ингредиенты успешно добавлены.');

    // 4. Создаем тестовые пиццы (привязываем к ним созданные ингредиенты)
    const pizzaData = [
      {
        title: 'Пепперони',
        description: 'Классическая пицца с пикантной колбасой пепперони и обилием моцареллы.',
        price: 27,
        imageUrl: '/uploads/pepperoni.jpg',
        ingredients: [savedIngredients[0], savedIngredients[1], savedIngredients[8]], // Сыр, Пепперони, Томатный соус
      },
      {
        title: 'Маргарита',
        description: 'Простота и вкус: сочные томаты, ароматный соус и нежный сыр.',
        price: 22,
        imageUrl: '/uploads/margarita.jpg',
        ingredients: [savedIngredients[0], savedIngredients[2], savedIngredients[8]], // Сыр, Томаты, Томатный соус
      },
      {
        title: 'Цыпленок Барбекю',
        description: 'Пикантная пицца с куриным филе, грибами и дымным соусом Барбекю.',
        price: 21,
        imageUrl: '/uploads/barbecue.jpg',
        ingredients: [
          savedIngredients[0],
          savedIngredients[3],
          savedIngredients[6],
          savedIngredients[9],
        ], // Сыр, Грибы, Курица, Барбекю соус
      },
    ];

    await this.pizzaRepository.save(this.pizzaRepository.create(pizzaData));
    console.log('✅ Тестовые пиццы успешно добавлены.');

    // 5. Создаем 2 промокода (один активный, один просроченный)
    const now = new Date();
    const futureDate = new Date();
    futureDate.setMonth(now.getMonth() + 3); // Действует еще 3 месяца

    const pastDate = new Date();
    pastDate.setMonth(now.getMonth() - 1); // Истек 1 месяц назад

    const promoCodes = [
      {
        code: 'PIZZA2026',
        discountPercent: 15,
        expiresAt: futureDate,
        isActive: true,
      },
      {
        code: 'OLD10',
        discountPercent: 10,
        expiresAt: pastDate,
        isActive: false,
      },
    ];

    await this.promoCodeRepository.save(this.promoCodeRepository.create(promoCodes));
    console.log('✅ Промокоды успешно добавлены.');
    console.log('🎉 Сиддинг базы данных успешно завершен!');
  }
}
