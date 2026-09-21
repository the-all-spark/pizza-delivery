// * Модуль меню пицц микросервиса pizza-service

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // ◄— ДОБАВЛЕН ИМПОРТ ДЛЯ КРОНА
 
import { PizzaController } from './pizza.controller';
import { PizzaService } from './pizza.service';
import { Pizza } from './pizza.entity';

// Импортируем модуль ингредиентов для получения доступа к его репозиториям
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
  imports: [
    // 1. Регистрируем сущность Pizza для взаимодействия с базой данных PostgreSQL
    TypeOrmModule.forFeature([Pizza]),

    // 2. Инициализируем глобальный планировщик задач для работы декораторов @Cron()
    ScheduleModule.forRoot(),

    // 3. Импортируем модуль ингредиентов, так как нам нужен доступ к таблице ingredients
    IngredientsModule,
  ],
  controllers: [
    // Подключаем контроллер, обрабатывающий сообщения RabbitMQ от шлюза
    PizzaController,
  ],
  providers: [
    // Подключаем службу бизнес-логики каталога пицц
    PizzaService,
  ],
  exports: [
    // Экспортируем сервис и репозиторий на случай привязки пицц к корзине (cart) или заказам (orders)
    PizzaService,
    TypeOrmModule,
  ],
})
export class PizzasModule {}
