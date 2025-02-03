import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Application } from '@/entity/Application';
import { EligibilityCriteria } from './EligibilityCriteria';
import { Vote } from './Vote';

export interface DistributionData {
  lastUpdated: string;
  distribution: Distribution[];
}

export interface Distribution {
  alloApplicationId: string;
  distributionPercentage: number;
}

@Entity()
@Index(['chainId', 'alloPoolId'], { unique: true })
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloPoolId: string;

  @OneToOne(() => EligibilityCriteria)
  @JoinColumn()
  eligibilityCriteria: EligibilityCriteria;

  @OneToMany(() => Application, application => application.pool)
  applications: Application[];

  @Column('simple-array', { nullable: true })
  metricIdentifiers: string[];

  @OneToMany(() => Vote, vote => vote.pool)
  votes: Vote[];

  @Column('simple-json', { nullable: true })
  distributionData: DistributionData | null;

  @Column('simple-json', { nullable: true })
  customDistributionData: DistributionData | null;
}
