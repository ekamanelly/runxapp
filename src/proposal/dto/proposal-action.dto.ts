import { IsUUID } from 'class-validator';

export class ProposalActionDto {
  @IsUUID()
  service_provider_id: string;
}
