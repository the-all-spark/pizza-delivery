import { Controller, Get } from '@nestjs/common';
import { PromoCodeService } from './promo-code.service';

@Controller()
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  @Get()
  getHello(): string {
    return this.promoCodeService.getHello();
  }
}
