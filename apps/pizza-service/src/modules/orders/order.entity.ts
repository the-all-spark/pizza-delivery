import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PromoCode } from '../promo-codes/promo-code.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum DeliveryMethod {
  COURIER = 'courier',
  PICKUP = 'pickup',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD_ONLINE = 'card_online',
  CARD_COURIER = 'card_courier',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'promo_code_id', type: 'int', nullable: true })
  promoCodeId: number | null;

  @Column({ type: 'text' })
  address: string;

  @Column({ name: 'delivery_method', type: 'enum', enum: DeliveryMethod })
  deliveryMethod: DeliveryMethod;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => PromoCode, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'promo_code_id' })
  promoCode: PromoCode | null;
}
