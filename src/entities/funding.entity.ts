import { PaymentMethod } from './../wallet/interfaces/funding.interface';
import { Entity, Column } from 'typeorm';
import { SharedEntity } from './shared.entity';

@Entity()
export class FundingEntity extends SharedEntity {
  @Column()
  amount: number;

  @Column()
  ref_no: string;

  @Column()
  bank_name: string;

  @Column({ enum: PaymentMethod })
  payment_method: PaymentMethod;
}
