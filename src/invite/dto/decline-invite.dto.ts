import { IsString, IsUUID } from 'class-validator';

export class DeclineInviteDto {
  @IsUUID()
  service_request_id: string;

  @IsString()
  invite_decline_reason: string;
}
