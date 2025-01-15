import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum MetricOrientation {
  Increase = 'increase',
  Decrease = 'decrease',
}

@Entity()
@Unique(['identifier'])
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  identifier: string;

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
