import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from 'typeorm';
import { Metric } from './Metric';

@Entity()
@Unique(['identifier', 'metricId'])
export class ApplicationToMetricScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  identifier: string; // Using alloProfileId for now

  // Unidirectional relation
  @OneToMany(() => Metric, { eager: true })
  metric: Metric;

  @Column('float')
  score: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column()
  metricId: number; // Explicitly define the foreign key column for pool
}
