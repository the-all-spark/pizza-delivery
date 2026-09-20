// * Модуль каталога ингредиентов пиццы микросервиса pizza-service
// регистрация сущности в TypeORM, чтобы сервис получил доступ к базе данных

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { Ingredient } from './ingredient.entity';

@Module({
  imports: [
    // 1. Регистрируем сущность Ingredient в TypeORM для этого модуля
    // Это автоматически создает провайдер Repository<Ingredient> в СУБД PostgreSQL
    TypeOrmModule.forFeature([Ingredient]),
  ],
  controllers: [
    // 2. Подключаем контроллер, который слушает RabbitMQ-сообщения от шлюза
    IngredientController,
  ],
  providers: [
    // 3. Подключаем службу бизнес-логики
    IngredientService,
  ],
  exports: [
    // 4. Экспортируем IngredientService и TypeOrmModule.
    IngredientService,
    TypeOrmModule,
  ],
})
export class IngredientsModule {}
