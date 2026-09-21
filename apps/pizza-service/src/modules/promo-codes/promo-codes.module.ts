// * Модуль промокодов микросервиса pizza-service

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodeController } from './promo-code.controller';
import { PromoCodeService } from './promo-code.service';
import { PromoCode } from './promo-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromoCode]),
  ],
  controllers: [PromoCodeController],
  providers: [PromoCodeService],
  exports: [PromoCodeService, TypeOrmModule], // Экспортируем для модуля заказов orders
})
export class PromoCodesModule {}
