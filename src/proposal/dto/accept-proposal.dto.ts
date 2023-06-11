import { IsString, IsUUID } from 'class-validator';

export class AcceptProposalDto {
  @IsUUID()
  service_provider_id: string;

  @IsUUID()
  service_request_id: string;

  @IsString()
  pin: string;
}
