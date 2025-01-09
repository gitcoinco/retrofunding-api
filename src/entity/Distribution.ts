import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
} from 'typeorm';
import { Pool } from './Pool';

@Entity()
@Unique(['poolId'])
export class Distribution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  alloPoolId: string;

  @Column()
  chainId: number;

  @Column({ default: false })
  finalized: boolean;

  @Column('simple-json')
  applicationData: Array<{
    alloApplicationId: string;
    distribution_percentage: number;
  }>;

  @ManyToOne(() => Pool, pool => pool.applications, {
    onDelete: 'CASCADE',
  })
  pool: Pool;

  @Column() // Explicitly define the foreign key column for pool
  poolId: number;
}
