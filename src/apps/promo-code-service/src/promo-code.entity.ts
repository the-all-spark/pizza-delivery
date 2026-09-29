import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../../order-service/src/order.entity';

@Entity('promo_codes')
export class PromoCode {
  @PrimaryGeneratedColumn({ name: 'promo_id' })
  promoId: number;

  @Column({ unique: true, type: 'varchar', length: 50 })
  code: string;

  @Column({ name: 'discount_percent', type: 'int' })
  discountPercent: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Order, (order) => order.promoCode)
  orders: Order[];
}
