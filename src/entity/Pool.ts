import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Unique,
  ManyToMany,
} from 'typeorm';
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

  @ManyToMany(() => Metric, metric => metric.pools)
  metrics: Metric[];
}
