import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Application } from './Application';
import { Metric } from './Metric';

@Entity()
export class ApplicationToMetricScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Application, application => application.allocations, {
    onDelete: 'CASCADE',
  })
  application: Application;

  @ManyToOne(() => Metric, metric => metric.allocations, {
    onDelete: 'CASCADE',
  })
  metric: Metric;

  @Column('float') // Assuming the score is a floating-point number
  score: number;
}
