import { IsString } from 'class-validator';

export class DeactivateAccountDto {
  @IsString()
  reason: string;
}
