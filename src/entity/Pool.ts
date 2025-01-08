import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Unique,
  OneToOne,
} from 'typeorm';
import { Application } from '@/entity/Application';
import { Metric } from './Metric';
import { EligibilityCriteria } from './EligibilityCriteria';
import { Vote } from './Vote';

@Entity()
@Unique(['chainId', 'alloPoolId'])
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloPoolId: string;

  @OneToOne(
    () => EligibilityCriteria,
    eligibilityCriteria => eligibilityCriteria.pool
  )
  eligibilityCriteria: EligibilityCriteria;

  @OneToMany(() => Application, application => application.pool)
  applications: Application[];

  @OneToMany(() => Metric, { eager: true }) // Unidirectional relation
  metrics: Metric[];

  @OneToMany(() => Vote, vote => vote.pool)
  votes: Vote[];
}
