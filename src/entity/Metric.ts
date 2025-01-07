import {
  Column,
  Entity,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Allocation } from './Allocation';
import { Pool } from './Pool';

export enum Priority {
  Ascending = 'ascending',
  Descending = 'descending',
}

@Entity()
@Unique(['name'])
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: Priority,
  })
  priority: Priority;

  @Column({
    default: false,
  })
  active: boolean;

  @OneToMany(() => Allocation, allocation => allocation.metric)
  allocations: Allocation[];

  @ManyToMany(() => Pool, pool => pool.metrics)
  pools: Pool[];
}
