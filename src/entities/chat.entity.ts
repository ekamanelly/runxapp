import { Column, Entity, ManyToOne } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { ActionCreator } from 'src/common/interface';
import { ChatMessageType } from 'src/chat/chat.interface';
import { ChatHead } from './chat-head.entity';

@Entity()
export class Chat extends SharedEntity {
  @Column()
  message: string;

  @Column()
  proposal_id: string;

  @Column({ enum: ActionCreator, type: 'enum' })
  user_type: ActionCreator;

  @Column({
    enum: ChatMessageType,
    type: 'enum',
    default: ChatMessageType.TEXT,
  })
  message_type: ChatMessageType;

  @Column({ default: false })
  is_sp_read: boolean;

  @Column({ default: false })
  is_client_read: boolean;

  @ManyToOne(() => ChatHead, (ch) => ch.chats)
  chat_head: ChatHead;
}
