import { IsBoolean, IsUUID } from 'class-validator';

export class MakeDefaultBankAccountDto {
  @IsUUID()
  id: string;

  @IsBoolean()
  is_default: boolean;
}
