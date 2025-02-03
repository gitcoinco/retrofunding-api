import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum EligibilityType {
  Linear = 'linear',
  // Weighted = 'weighted',
}

@Entity()
@Index(['chainId', 'alloPoolId'], { unique: true })
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
