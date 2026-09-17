// Детали заказа / Корзина внутри заказа (строчки чека)

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Pizza } from '../pizzas/pizza.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', type: 'int' })
  orderId: number;

  @Column({ name: 'pizza_item_id', type: 'int', nullable: true })
  pizzaItemId: number | null;

  // «снимок» названия пиццы на момент покупки
  @Column({ name: 'title_snapshot', type: 'varchar', length: 255 })
  titleSnapshot: string;

  // «снимок» цены пиццы на момент покупки
  @Column({ name: 'price_snapshot', type: 'decimal', precision: 10, scale: 2 })
  priceSnapshot: number;

  @Column({ type: 'int' })
  quantity: number;

  // Много строчек в чеке относятся к одному конкретному заказу 
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Много разных строчек в разных заказах разных людей могут ссылаться на одну и ту же пиццу
  @ManyToOne(() => Pizza, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pizza_item_id' })
  pizza: Pizza | null;
}
