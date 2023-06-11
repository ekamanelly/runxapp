import { IsString, Length } from 'class-validator';

export class VerifyPhoneNumberDto {
  @IsString()
  @Length(4)
  code: string;

  @IsString()
  phone_number: string;
}
