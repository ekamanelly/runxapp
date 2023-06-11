import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class FundWalletDto {
  @IsUUID()
  @IsOptional()
  sp_id: string;

  @IsUUID()
  @IsOptional()
  client_id: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  reference: string;
}
