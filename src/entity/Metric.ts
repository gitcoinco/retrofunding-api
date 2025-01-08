import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

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
  enabled: boolean;
}
