import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { UserRole } from '@shared/enums';

@Entity('users')
@Index('idx_users_names', ['firstName', 'lastName'])
export class User {
  @PrimaryGeneratedColumn({ name: 'u_id' })
  uId: number;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'avatar_path', type: 'varchar', nullable: true })
  avatarPath: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
