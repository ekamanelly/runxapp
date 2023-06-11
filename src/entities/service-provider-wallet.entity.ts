import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ServiceProviderWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  escrow: number;

  @Column()
  hold: number;

  @Column()
  available_balance: number;

  @OneToOne(() => User, (user: User) => user.sp_wallet)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  pending_funding: number;

  @Column()
  withdrawal: number;

  @Column()
  pending_withdrawal: number;
}
