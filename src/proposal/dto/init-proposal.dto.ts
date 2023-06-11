import { IsUUID } from 'class-validator';

export class InitProposalDto {
  @IsUUID()
  service_request_id: string;
}
