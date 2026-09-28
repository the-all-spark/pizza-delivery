// Модуль, который подключает сервис сидинга к главной базе данных

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';

// Импортируем все сущности, которые будут использоваться при заполнении
import { User } from '../../../../../src/apps/auth-service/src/modules/users/user.entity';
import { Pizza } from '../../../../../src/apps/pizza-service/src/modules/pizzas/pizza.entity';
import { PromoCode } from '../../../../../src/apps/pizza-service/src/modules/promo-codes/promo-code.entity';
import { Ingredient } from '../ingredients/ingredient.entity';

@Module({
  imports: [
    // Регистрируем репозитории в контексте этого модуля
    TypeOrmModule.forFeature([User, Pizza, PromoCode, Ingredient]),
  ],
  providers: [SeedService],
  exports: [SeedService], // Экспортируем, если понадобится вызывать вручную
})
export class SeedModule {}
