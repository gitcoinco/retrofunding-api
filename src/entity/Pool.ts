import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Unique,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from '@/entity/Application';
import { EligibilityCriteria } from './EligibilityCriteria';
import { Vote } from './Vote';

export interface Distribution {
  alloApplicationId: string;
  distribution_percentage: number;
}

@Entity()
@Unique(['chainId', 'alloPoolId'])
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
  distribution: Distribution[];
}
