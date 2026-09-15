// import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
// import { Ingredient } from '../ingredients/ingredient.entity';
// import { CartItem } from '../cart/cart-item.entity';
// import { OrderItem } from '../orders/order-item.entity';

// @Entity('pizzas')
// export class Pizza {
//   @PrimaryGeneratedColumn({ name: 'p_id' })
//   pId: number;

//   @Column({ unique: true, type: 'varchar', length: 255 })
//   title: string;

//   @Column({ type: 'text', nullable: true })
//   description: string;

//   @Column({ name: 'image_url', type: 'varchar', length: 500 })
//   imageUrl: string;

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   price: number;

//   @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
//   createdAt: Date;

//   @Column({ name: 'last_ordered_at', type: 'timestamp', nullable: true })
//   lastOrderedAt: Date;

//   // Используем функцию-замыкание, чтобы избежать проблем инициализации
//   @ManyToMany(() => Ingredient, (ingredient) => ingredient.pizzas, { onDelete: 'CASCADE' })
//   @JoinTable({
//     name: 'pizza_ingredients',
//     joinColumn: { name: 'pizza_id', referencedColumnName: 'pId' },
//     inverseJoinColumn: { name: 'ingredient_id', referencedColumnName: 'ingrId' },
//   })
//   ingredients: Ingredient[];

//   @OneToMany(() => CartItem, (cartItem) => cartItem.pizza)
//   cartItems: CartItem[];

//   @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
//   orderItems: OrderItem[];
// }

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Ingredient } from '../ingredients/ingredient.entity';

@Entity('pizzas')
export class Pizza {
  @PrimaryGeneratedColumn({ name: 'p_id' })
  pId: number;

  @Column({ unique: true, type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'last_ordered_at', type: 'timestamp', nullable: true })
  lastOrderedAt: Date;

  @ManyToMany(() => Ingredient, (ingredient) => ingredient.pizzas, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'pizza_ingredients',
    joinColumn: { name: 'pizza_id', referencedColumnName: 'pId' },
    inverseJoinColumn: { name: 'ingredient_id', referencedColumnName: 'ingrId' },
  })
  ingredients: Ingredient[];
  
  // СВЯЗИ С CART_ITEMS И ORDER_ITEMS ПОЛНОСТЬЮ УДАЛЕНЫ!
}
