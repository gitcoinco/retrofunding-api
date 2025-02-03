import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  Index,
} from 'typeorm';
import { Pool } from '@/entity/Pool';

@Entity()
@Index(['alloPoolId', 'chainId', 'alloApplicationId'], { unique: true })
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloPoolId: string;

  @Column()
  alloApplicationId: string;

  @ManyToOne(() => Pool, pool => pool.applications, {
    onDelete: 'CASCADE',
  })
  pool: Pool;
}
