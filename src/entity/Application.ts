import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Pool } from '@/entity/Pool';

@Entity()
@Unique(['alloApplicationId', 'poolId'])
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloApplicationId: string;

  @Column()
  alloProfileId: string; // TODO: check if needed

  @ManyToOne(() => Pool, pool => pool.applications, {
    onDelete: 'CASCADE',
  })
  pool: Pool;

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;
}
