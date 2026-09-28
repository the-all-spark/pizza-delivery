// «Шапка» заказа (общая информация)

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PromoCode } from '../../pizza-service/src/modules/promo-codes/promo-code.entity';
import { OrderStatus, DeliveryMethod, PaymentMethod } from '@shared/enums';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'promo_code_id', type: 'int', nullable: true })
  promoCodeId: number | null; // ID примененного купона

  @Column({ type: 'text' })
  address: string;

  @Column({ name: 'delivery_method', type: 'enum', enum: DeliveryMethod })
  deliveryMethod: DeliveryMethod;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // Много разных заказов могут использовать один и тот же промокод
  @ManyToOne(() => PromoCode, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'promo_code_id' })
  promoCode: PromoCode | null;

  // у одного заказа может быть много позиций пицц (строчек в чеке)
  @OneToMany('OrderItem', (item: any) => item.order)
  items: any[]; // Меняем strict-класс на any для разрыва циклического импорта на этапе компиляции
}
