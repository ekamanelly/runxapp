import { IsString, IsUUID } from 'class-validator';

export class RejectProposalDto {
  @IsUUID()
  service_provider_id: string;

  @IsUUID()
  service_request_id: string;

  @IsString()
  proposal_reject_reason: string;
}
