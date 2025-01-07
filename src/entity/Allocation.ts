import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Application } from './Application';
import { Metric } from './Metric';

@Entity()
@Unique(['allocator'])
export class Allocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 42 })
  allocator: string;

  @Column()
  allocationPercentage: number;

  @ManyToOne(() => Application, application => application.allocations)
  application: Application;

  @ManyToOne(() => Metric, metric => metric.allocations)
  metric: Metric;

  @Column() // Explicitly define the foreign key column for application
  applicationId: number;

  @Column() // Explicitly define the foreign key column for metric
  metricId: number;
}
