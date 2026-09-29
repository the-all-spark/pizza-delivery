import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Pizza } from '../../pizza-service/src/pizza.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn({ name: 'ingr_id' })
  ingrId: number;

  @Column({ unique: true, type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToMany(() => Pizza, (pizza) => pizza.ingredients)
  pizzas: Pizza[];
}
