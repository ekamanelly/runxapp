import { IsString, IsUUID } from 'class-validator';

export class PayServiceProviderDto {
  @IsUUID()
  service_provider_id: string;

  @IsUUID()
  service_request_id: string;

  @IsString()
  pin: string;
}
