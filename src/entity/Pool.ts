import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Unique,
  ManyToMany,
} from 'typeorm';
import { Vote } from './Vote';
import { Application } from '@/entity/Application';
import { Metric } from './Metric';

@Entity()
@Unique(['chainId', 'alloPoolId'])
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloPoolId: string;

  @OneToMany(() => Application, application => application.pool)
  applications: Application[];

  // Unidirectional relation
  @ManyToMany(() => Metric, { eager: true })
  metrics: Metric[];

  @OneToMany(() => Vote, vote => vote.pool)
  votes: Vote[];
}
