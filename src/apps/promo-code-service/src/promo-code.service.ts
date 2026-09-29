import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

import { PromoCode } from '@shared/entities';
import { CreatePromoCodePayload, UpdatePromoCodePayload } from './promo-code-interfaces';

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
  ) {}

  // ==========================================
  // 1. ПОЛУЧИТЬ ВСЕ ПРОМОКОДЫ
  // ==========================================
  async findAll(): Promise<PromoCode[]> {
    return await this.promoCodeRepository.find({
      order: { expiresAt: 'DESC' },
    });
  }

  // ==========================================
  // 2. ПОЛУЧИТЬ ПРОМОКОД ПО ID
  // ==========================================
  async findById(id: number): Promise<PromoCode> {
    const promo = await this.promoCodeRepository.findOne({
      where: { promoId: id },
    });

    if (!promo) {
      throw new RpcException({
        statusCode: 404,
        message: `Promo code with ID ${id} not found.`,
      });
    }

    return promo;
  }

  // ==========================================
  // 3. СОЗДАТЬ ПРОМОКОД
  // ==========================================
  async create(payload: CreatePromoCodePayload): Promise<PromoCode> {
    const { code, discountPercent, expiresAt, isActive } = payload;

    const existing = await this.promoCodeRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: `A promo code with the code "${code}" already exists in the database.`,
      });
    }

    const newPromo = this.promoCodeRepository.create({
      code: code.toUpperCase(),
      discountPercent,
      expiresAt: new Date(expiresAt),
      isActive: isActive ?? true,
    });

    return await this.promoCodeRepository.save(newPromo);
  }

  // ==========================================
  // 4. ИЗМЕНИТЬ ПРОМОКОД ПО ID
  // ==========================================
  async update(payload: UpdatePromoCodePayload): Promise<PromoCode> {
    const { promoId, code, discountPercent, expiresAt, isActive } = payload;
    const promo = await this.findById(promoId);
    const updateFields: Partial<PromoCode> = {};

    if (code) {
      const duplicate = await this.promoCodeRepository.findOne({
        where: { code: code.toUpperCase() },
      });
      if (duplicate && duplicate.promoId !== promoId) {
        throw new RpcException({
          statusCode: 409,
          message: `The promo code "${code}" is already being used by another coupon.`,
        });
      }
      updateFields.code = code.toUpperCase();
    }

    if (discountPercent !== undefined) updateFields.discountPercent = discountPercent;
    if (expiresAt) updateFields.expiresAt = new Date(expiresAt);
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updated = this.promoCodeRepository.merge(promo, updateFields);
    return await this.promoCodeRepository.save(updated);
  }

  // ==========================================
  // 5. УДАЛЕНИЕ ПРОМОКОДА ПО ID
  // ==========================================
  async delete(id: number): Promise<{ success: boolean }> {
    const promo = await this.findById(id);

    await this.promoCodeRepository.delete(promo.promoId);
    return { success: true };
  }
}
