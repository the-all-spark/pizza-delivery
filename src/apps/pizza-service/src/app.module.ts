// Главный модуль микросервиса pizza-service

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDatabase } from 'typeorm-extension';
import { DataSourceOptions } from 'typeorm';

// Импорт сущностей для генерации таблиц
import { Ingredient } from './modules/ingredients/ingredient.entity';
import { Pizza } from './modules/pizzas/pizza.entity';
import { CartItem } from './modules/cart/cart-item.entity';
import { PromoCode } from './modules/promo-codes/promo-code.entity';
import { Order } from '../src/modules/orders/order.entity';
import { OrderItem } from '../src/modules/orders/order-item.entity';
import { User } from '../../auth-service/src/modules/users/user.entity';

// Импорт модулей
import { PizzasModule } from './modules/pizzas/pizzas.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { CartModule } from './modules/cart/cart.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { OrdersModule } from '../src/modules/orders/orders.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    // Конфигурация окружения (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Настройка подключения к СУБД PostgreSQL
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
          entities: [User, Ingredient, Pizza, CartItem, PromoCode, Order, OrderItem],
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

    // Подключение логических модулей приложения
    PizzasModule,
    IngredientsModule,
    CartModule,
    PromoCodesModule,
    OrdersModule,
    SeedModule,
  ],
})
export class AppModule {}
