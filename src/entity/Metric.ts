import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum MetricOrientation {
  Increase = 'increase',
  Decrease = 'decrease',
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
    enum: MetricOrientation,
  })
  orientation: MetricOrientation;

  @Column({
    default: false,
  })
  enabled: boolean;
}
