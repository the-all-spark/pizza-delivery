import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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

  @Column({ name: 'title_snapshot', type: 'varchar', length: 255 })
  titleSnapshot: string;

  @Column({ name: 'price_snapshot', type: 'decimal', precision: 10, scale: 2 })
  priceSnapshot: number;

  @Column({ type: 'int' })
  quantity: number;

  // Связи
  // @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'order_id' })
  // order: Order;

  // ИСПРАВЛЕНИЕ: Убрали обратную ссылку (order) => order.items
  @ManyToOne(() => Order, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Pizza, { onDelete: 'SET NULL' }) // Убрали второй аргумент (pizza) => pizza.orderItems
  @JoinColumn({ name: 'pizza_item_id' })
  pizza: Pizza | null;

//   @ManyToOne(() => Pizza, (pizza) => pizza.orderItems, { onDelete: 'SET NULL' })
//   @JoinColumn({ name: 'pizza_item_id' })
//   pizza: Pizza | null;
}
