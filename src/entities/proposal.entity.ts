import { ProposalStatus } from '../proposal/proposal.interface';
import { User } from 'src/entities/user.entity';
import { ServiceRequest } from './service-request.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SharedEntity } from './shared.entity';
import {
  DisputeResolveAction,
  DisputeStatus,
  Disputant,
  DisputeResolver,
} from 'src/dispute/dispute.interface';
import { ActionCreator } from 'src/common/interface';
import { Transaction } from './transaction.entity';
import { ClientRating } from './client-rating.entity';
import { SpRating } from './sp-rating.entity';
import { Chat } from './chat.entity';
import { ChatHead } from './chat-head.entity';

@Entity()
export class Proposal extends SharedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ServiceRequest, (sr) => sr.service_request_proposals)
  @JoinColumn()
  service_request: ServiceRequest;

  @ManyToOne(() => User, (user) => user.service_request_proposals)
  @JoinColumn()
  service_provider: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  invite_date: Date;

  @Column({ nullable: true })
  invite_accept_date: Date;

  @Column({ nullable: true })
  invite_decline_date: Date;

  @Column({ nullable: true })
  invite_decline_reason: string;

  @Column({ nullable: true })
  invite_cancel_date: Date;

  @Column({ nullable: true })
  invite_cancel_reason: string;

  @Column({ nullable: true })
  cancel_date: Date;

  @Column({ nullable: true })
  cancel_reason: string;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.INVITED,
  })
  status: ProposalStatus;

  @Column({
    type: 'enum',
    enum: ActionCreator,
    nullable: true,
  })
  cancelled_by: ActionCreator;

  @Column({ nullable: true })
  proposal_sent_date: Date;

  @Column({ nullable: true })
  invoice_id: string;

  @Column({ nullable: true })
  proposal_accept_date: Date;

  @Column({ nullable: true })
  sp_service_fee: number;

  @Column({ nullable: true })
  client_service_fee: number;

  @Column({ nullable: true })
  sp_proposal_amount: number;

  @Column({ nullable: true })
  amount_paid_date: Date;

  @Column({ nullable: true })
  dispute_date: Date;

  @Column({ nullable: true })
  dispute_resolve_date: Date;

  @Column({ nullable: true, enum: DisputeResolver, type: 'enum' })
  dispute_resolver: DisputeResolver;

  @Column({ type: 'enum', enum: DisputeResolveAction, nullable: true })
  dispute_resolve_action: DisputeResolveAction;

  @Column({ nullable: true })
  dispute_resolve_reason: string;

  @Column({ nullable: true })
  dispute_reason: string;

  @Column({ type: 'enum', enum: DisputeStatus, nullable: true })
  dispute_status: DisputeStatus;

  @Column({ nullable: true })
  dispute_queue_id: number;

  @Column({ type: 'enum', enum: Disputant, nullable: true })
  disputant: Disputant;

  @Column({ nullable: true })
  job_complete_date: Date;

  @Column({ nullable: true })
  job_complete_note: string;

  @Column({ nullable: true })
  job_complete_file_1: string;

  @Column({ nullable: true })
  job_complete_file_2: string;

  @Column({ nullable: true })
  job_complete_file_3: string;

  @Column({ nullable: true })
  job_complete_file_4: string;

  @Column({ nullable: true })
  job_complete_file_5: string;

  @Column({ nullable: true })
  job_complete_file_6: string;

  @OneToMany(() => Transaction, (transaction) => transaction.proposal)
  transactions: Transaction[];

  @OneToOne(() => ClientRating, (clientProposal) => clientProposal.proposal)
  client_rating: ClientRating;

  @OneToOne(() => SpRating, (spRating) => spRating.proposal)
  sp_rating: SpRating;

  @OneToOne(() => ChatHead, (ch) => ch.proposal)
  chat_head: ChatHead;
}
