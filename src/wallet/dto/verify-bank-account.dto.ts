import { IsString } from 'class-validator';

export class VerifyBankAccountDto {
  @IsString()
  bank_code: string;

  @IsString()
  account_number: string;
}
