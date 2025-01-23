import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MetricOrientation {
  Increase = 'increase',
  Decrease = 'decrease',
}

@Entity()
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  identifier: string;

  @Column()
  title: string;

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
