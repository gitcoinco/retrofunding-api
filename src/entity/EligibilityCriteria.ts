import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export enum EligibilityType {
  Linear = 'linear',
  // Weighted = 'weighted',
}

@Entity()
@Unique(['chainId', 'alloPoolId'])
export class EligibilityCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chainId: number;

  @Column()
  alloPoolId: string;

  @Column({
    type: 'enum',
    enum: EligibilityType,
  })
  eligibilityType: EligibilityType;

  @Column('json')
  data: any;
}
