import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Pool } from './Pool';

@Entity()
@Unique(['poolId', 'voter'])
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 42 })
  voter: string;

  @Column()
  alloPoolId: string;

  @Column()
  chainId: number;

  @Column('simple-json')
  ballot: Array<{
    metricId: number;
    voteShare: number; // Percentage of the total vote allocated to this metric
  }>;

  @ManyToOne(() => Pool, pool => pool.votes)
  pool: Pool;

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;
}
