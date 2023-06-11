import { IsBoolean, IsString } from 'class-validator';

export class ToggleTwoFADto {
  @IsBoolean()
  enable_two_fa: boolean;

  @IsString()
  two_fa_code: string;
}
