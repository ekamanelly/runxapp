import { IsString, IsUUID } from 'class-validator';

export class SendChatDto {
  @IsString()
  message: string;

  @IsUUID()
  proposal_id: string;
}
