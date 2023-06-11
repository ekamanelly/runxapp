import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Proposal } from './proposal.entity';
import { Chat } from './chat.entity';

@Entity()
export class ChatHead extends SharedEntity {
  @OneToOne(() => Proposal, (proposal) => proposal.chat_head)
  @JoinColumn()
  proposal: Proposal;

  @Column()
  @Index()
  proposal_id: string;

  @Column()
  unread_count: number;

  @Column()
  service_name: string;

  @OneToMany(() => Chat, (chat) => chat.chat_head)
  chats: Chat[];
}
