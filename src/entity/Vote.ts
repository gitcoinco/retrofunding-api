import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Pool } from './Pool';

export interface Ballot {
  metricIdentifier: string;
  voteShare: number; // Percentage of the total vote allocated to this metric
}

@Entity()
@Unique(['poolId', 'voter'])
@Index(['alloPoolId', 'chainId', 'voter'], { unique: true })
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
  ballot: Ballot[];

  @ManyToOne(() => Pool, pool => pool.votes)
  pool: Pool;

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
