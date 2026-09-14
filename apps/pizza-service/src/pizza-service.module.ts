import { Module } from '@nestjs/common';
import { PizzaServiceController } from './pizza-service.controller';
import { PizzaServiceService } from './pizza-service.service';

@Module({
  imports: [],
  controllers: [PizzaServiceController],
  providers: [PizzaServiceService],
})
export class PizzaServiceModule {}
