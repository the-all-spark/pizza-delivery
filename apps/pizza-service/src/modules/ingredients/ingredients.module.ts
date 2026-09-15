import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingredient } from './ingredient.entity';
import { IngredientServiceService } from './ingredient.service';
import { IngredientServiceController } from './ingredient.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ingredient])],
  controllers: [IngredientServiceController],
  providers: [IngredientServiceService],
  exports: [TypeOrmModule],
})
export class IngredientsModule {}
