import { IsNumber, IsString } from 'class-validator';

export class AddBankAccountDto {
  @IsString()
  bank_code: string;

  @IsString()
  account_number: string;

  @IsString()
  bank_name: string;
}
