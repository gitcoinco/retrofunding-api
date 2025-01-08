import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Metric } from './Metric';

@Entity()
export class ApplicationToMetricScore {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  identifier: string; // TODO: Decoupled identifier (userAddress, profile ID, etc.)

  @ManyToOne(() => Metric, metric => metric, {
    onDelete: 'CASCADE',
  })
  metric: Metric;

  @Column('float')
  score: number;

  @Column({ default: true })
  latest: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
