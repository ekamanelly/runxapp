import { IsString, IsUUID } from 'class-validator';

export class ServiceProviderCancelProposalDto {
  @IsUUID()
  id: string;

  @IsUUID()
  service_request_id: string;

  @IsString()
  proposal_cancel_reason: string;
}
