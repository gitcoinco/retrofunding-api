import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Pool } from './Pool';

@Entity()
@Unique(['poolId', 'allocator'])
export class Allocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 42 })
  allocator: string;

  @Column()
  alloPoolId: number;

  @Column()
  chainId: number;

  @Column('simple-json')
  ballot: Array<{
    metricId: number;
    allocationPercentage: number;
  }>;

  @ManyToOne(() => Pool, pool => pool.allocations)
  pool: Pool;

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;
}
