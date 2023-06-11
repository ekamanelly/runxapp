import { IsString, IsUUID } from 'class-validator';

export class AcceptInviteDto {
  @IsUUID()
  service_request_id: string;
}
