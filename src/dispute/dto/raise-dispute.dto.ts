import { IsEnum, IsString, IsUUID } from 'class-validator';
import { Disputant } from 'src/dispute/dispute.interface';

export class RaiseDisputeDto {
  @IsEnum(Disputant)
  disputant: Disputant;

  @IsUUID('all')
  service_provider_id: string;

  @IsUUID('all')
  service_request_id: string;

  @IsString()
  dispute_reason: string;
}
