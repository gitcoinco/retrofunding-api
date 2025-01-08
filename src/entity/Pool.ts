import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToMany,
  Unique,
  ManyToMany,
} from 'typeorm';
import { Allocation } from './Allocation';
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

  @OneToMany(() => Allocation, allocation => allocation.pool)
  allocations: Allocation[];
}
