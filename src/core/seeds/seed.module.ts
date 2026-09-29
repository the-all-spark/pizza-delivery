import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';

import { Pizza, User, PromoCode, Ingredient } from '@shared/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, PromoCode, Ingredient, Pizza])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
