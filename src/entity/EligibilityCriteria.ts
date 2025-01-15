import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToOne,
} from 'typeorm';
import { Pool } from './Pool';

export enum EligibilityType {
  Linear = 'linear',
  // Weighted = 'weighted',
}

@Entity()
@Unique(['chainId', 'alloPoolId'])
export class EligibilityCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloPoolId: string;

  @Column({
    type: 'enum',
    enum: EligibilityType,
  })
  eligibilityType: EligibilityType;

  @OneToOne(() => Pool, pool => pool.id, {
    onDelete: 'CASCADE',
  })
  pool: Pool;

  @Column('json')
  data: any;
}
