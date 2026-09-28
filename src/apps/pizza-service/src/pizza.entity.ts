import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Ingredient } from '../../ingredients-service/src/ingredient.entity';

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

  @ManyToMany(() => Ingredient, (ingredient) => ingredient.pizzas, {
    onDelete: 'CASCADE',
  })

  // создание таблицы в БД
  @JoinTable({
    name: 'pizza_ingredients', // Имя промежуточной таблицы
    joinColumn: { name: 'pizza_id', referencedColumnName: 'pId' }, // Связь с текущей сущностью (Pizza)
    inverseJoinColumn: {
      name: 'ingredient_id', // Связь с противоположной сущностью (Ingredient)
      referencedColumnName: 'ingrId',
    },
  })
  ingredients: Ingredient[];
}
