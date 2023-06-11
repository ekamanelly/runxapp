import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  DisputeResolver,
  DisputeResolveAction,
} from 'src/dispute/dispute.interface';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolver)
  @IsOptional()
  resolver: DisputeResolver = DisputeResolver.ADMIN;

  @IsUUID('all')
  service_provider_id: string;

  @IsEnum(DisputeResolveAction)
  dispute_resolve_action: DisputeResolveAction;

  @IsString()
  dispute_resolve_reason: string;

  @IsUUID('all')
  service_request_id: string;
}
