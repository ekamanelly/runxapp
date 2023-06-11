import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Proposal } from './proposal.entity';
import { User } from './user.entity';

@Entity()
export class SpRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  star: number;

  @Column({ nullable: true })
  review: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Proposal, (proposal) => proposal.sp_rating)
  @JoinColumn({ name: 'proposal_id' })
  proposal: Proposal;

  @ManyToOne(() => User, (user) => user.sp_ratings)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
