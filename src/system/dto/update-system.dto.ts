import { IsOptional } from 'class-validator';

export class UpdateSystemDto {
  @IsOptional()
  allow_withrawal: boolean;

  @IsOptional()
  sp_service_fee: number;

  @IsOptional()
  client_service_fee: number;
}
