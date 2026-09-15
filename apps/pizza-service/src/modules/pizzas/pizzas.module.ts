import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pizza } from './pizza.entity';
import { PizzaServiceService } from './pizza-service.service';
import { PizzaServiceController } from './pizza-service.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pizza])],
  controllers: [PizzaServiceController],
  providers: [PizzaServiceService],
  exports: [TypeOrmModule], // Экспортируем, чтобы другие модули (например, корзина) могли видеть репозиторий пиццы
})
export class PizzasModule {}
