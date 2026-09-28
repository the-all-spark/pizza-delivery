import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';

import { User } from '../../apps/auth-service/src/modules/users/user.entity';
import { Pizza } from '../../apps/pizza-service/src/pizza.entity';
import { PromoCode } from '../../apps/promo-codes-service/src/promo-code.entity';
import { Ingredient } from '../../apps/ingredients-service/src/ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Pizza, PromoCode, Ingredient])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
