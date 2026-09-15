import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pizza } from './pizza.entity';
import { PizzaService } from './pizza.service';
import { PizzaController } from './pizza.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pizza])],
  controllers: [PizzaController],
  providers: [PizzaService],
  exports: [TypeOrmModule],
})
export class PizzasModule {}
