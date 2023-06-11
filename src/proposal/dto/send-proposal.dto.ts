import { IsNumber, IsUUID } from 'class-validator';

export class SendProposalDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  service_fee: number;

  @IsUUID()
  service_request_id: string;
}
