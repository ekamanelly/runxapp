import { PartialType } from '@nestjs/mapped-types';
import { SendChatDto } from './send-chat.dto';

export class UpdateChatDto extends PartialType(SendChatDto) {
  id: number;
}
