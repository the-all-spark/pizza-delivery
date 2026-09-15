import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCode } from './promo-code.entity';
import { PromoCodeService } from './promo-code.service';
import { PromoCodeController } from './promo-code.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode])],
  controllers: [PromoCodeController],
  providers: [PromoCodeService],
  exports: [TypeOrmModule],
})
export class PromoCodesModule {}
