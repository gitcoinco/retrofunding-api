import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  Unique,
  OneToMany,
} from 'typeorm';
import { Allocation } from './Allocation';
import { Pool } from '@/entity/Pool';

@Entity()
@Unique(['alloApplicationId', 'poolId', 'chainId'])
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloApplicationId: string;

  @ManyToOne(() => Pool, pool => pool.applications, {
    onDelete: 'CASCADE',
  })
  pool: Pool;

  @OneToMany(() => Allocation, allocation => allocation.application, {
    onDelete: 'CASCADE',
  })
  allocations: Allocation[];

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;
}
