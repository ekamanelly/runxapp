import { SharedEntity } from './shared.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import {
  TransactionEvent,
  TransactionStatus,
  TransactionType,
  TransactionWallet,
} from 'src/wallet/interfaces/transaction.interface';
import { Proposal } from './proposal.entity';
import { User } from './user.entity';
import { BankAccount } from './bank-account.entity';

@Entity()
export class Transaction extends SharedEntity {
  @Column({ nullable: true })
  description: string;

  @Column()
  amount: number;

  @Column({ nullable: true })
  bal_before: number;

  @Column({ nullable: true })
  bal_after: number;

  @Column({ default: 'NGN', nullable: true })
  curr_code: string;

  @Column({ type: 'enum', enum: TransactionType, nullable: true })
  type: TransactionType;

  @Column({ nullable: true })
  @Index()
  user_id: string;

  @Column({ nullable: true })
  @Index()
  reference: string;

  @Column({ type: 'enum', enum: TransactionEvent, nullable: true })
  event: TransactionEvent;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn()
  user: User;

  // used by service request related transactions
  @Column({ nullable: true })
  proposal_id: string;

  @ManyToOne(() => Proposal, (proposal) => proposal.transactions)
  @JoinColumn()
  proposal: Proposal;

  @Column({ type: 'enum', enum: TransactionWallet })
  wallet: TransactionWallet;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.SETTLED,
  })
  status: TransactionStatus;

  // used for withdrawal
  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount)
  dest_bank_account: BankAccount;
}
