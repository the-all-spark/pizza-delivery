// * Контроллер очередей микросервиса промокодов

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PromoCodeService } from './promo-code.service';
import type { CreatePromoCodePayload, UpdatePromoCodePayload } from './promo-codes-interfaces';

@Controller()
export class PromoCodeController {
  constructor(private readonly promoCodeService: PromoCodeService) {}

  // * 1. Получить все промокоды
  @MessagePattern('get_all_promo_codes')
  async getAllPromoCodes() {
    return await this.promoCodeService.findAll();
  }

  // * 2. Получить промокод по его id
  @MessagePattern('get_promo_code_by_id')
  async getPromoCodeById(@Payload() data: { id: number }) {
    return await this.promoCodeService.findById(data.id);
  }

  // * 3. Создать новый промокод
  @MessagePattern('admin_create_promo_code')
  async createPromoCode(@Payload() data: CreatePromoCodePayload) {
    return await this.promoCodeService.create(data);
  }

  // * 4. Изменить существующий промокод по его id
  @MessagePattern('admin_update_promo_code')
  async updatePromoCode(@Payload() data: UpdatePromoCodePayload) {
    return await this.promoCodeService.update(data);
  }

  // * 5. Удалить промокод по его id
  @MessagePattern('admin_delete_promo_code')
  async deletePromoCode(@Payload() data: { promoId: number }) {
    return await this.promoCodeService.delete(data.promoId);
  }
}
