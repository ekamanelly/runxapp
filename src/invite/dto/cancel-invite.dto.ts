import { IsString, IsUUID } from 'class-validator';

export class CancelInviteDto {
  @IsUUID()
  service_request_id: string;

  @IsUUID()
  service_provider_id: string;

  @IsString()
  invite_cancel_reason: string;
}
