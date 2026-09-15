// Главный модуль сервиса (подключение к БД и RabbitMQ)

/*
Теперь соберём все локальные бизнес-модули и сущности вместе в корневом модуле 
приложения. Как и в случае с auth-service, мы используем асинхронную конфигурацию
 для чтения переменных среды окружения и безопасную инициализацию через 
 initialDatabase: 'postgres'.
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDatabase } from 'typeorm-extension';
import { DataSourceOptions } from 'typeorm';

// Импорт сущностей для генерации таблиц
// import { Pizza } from './modules/pizzas/pizza.entity';
// import { Ingredient } from './modules/ingredients/ingredient.entity';
// import { CartItem } from './modules/cart/cart-item.entity';
// import { PromoCode } from './modules/promo-codes/promo-code.entity';
// import { Order } from './modules/orders/order.entity';
// import { OrderItem } from './modules/orders/order-item.entity';

// СНАЧАЛА импортируем ингредиенты (у них нет OneToMany к пиццам, только ManyToMany)
import { Ingredient } from './modules/ingredients/ingredient.entity';
// ЗАТЕМ импортируем пиццу
import { Pizza } from './modules/pizzas/pizza.entity';
// ЗАТЕМ все остальные
import { CartItem } from './modules/cart/cart-item.entity';
import { PromoCode } from './modules/promo-codes/promo-code.entity';
import { Order } from './modules/orders/order.entity';
import { OrderItem } from './modules/orders/order-item.entity';

// Импорт модулей
import { PizzasModule } from './modules/pizzas/pizzas.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { CartModule } from './modules/cart/cart.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    // 1. Конфигурация окружения (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Настройка подключения к СУБД PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const options: DataSourceOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: Number(configService.get('DB_PORT', 5432)),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME', 'pizza_delivery'),
          // Перечисляем все сущности этого микросервиса
          // entities: [Pizza, Ingredient, CartItem, PromoCode, Order, OrderItem],
          entities: [Ingredient, Pizza, CartItem, PromoCode, Order, OrderItem],
          // Автоматическая генерация и обновление структуры таблиц
          synchronize: true,
          logging: ['error', 'schema', 'warn'],
        };

        // Защитная проверка существования БД перед стартом через системную базу postgres
        await createDatabase({
          options,
          initialDatabase: 'postgres',
          ifNotExist: true,
        });

        return options;
      },
    }),

    // 3. Подключение логических модулей приложения
    PizzasModule,
    IngredientsModule,
    CartModule,
    PromoCodesModule,
    OrdersModule,
  ],
})
export class AppModule {}
