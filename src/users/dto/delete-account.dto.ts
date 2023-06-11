import { IsString } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  reason: string;
}
