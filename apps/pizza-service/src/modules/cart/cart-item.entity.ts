import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Pizza } from '../pizzas/pizza.entity';

@Entity('cart_items')
@Unique(['userId', 'pizzaId'])
export class CartItem {
  @PrimaryGeneratedColumn({ name: 'cart_id' })
  cartId: number;

  // Храним ID пользователя, полученный из JWT/микросервиса Auth
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'pizza_id', type: 'int' })
  pizzaId: number;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Pizza, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pizza_id' })
  pizza: Pizza;
}
