import { IsEmail, IsEnum, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @Length(4)
  code: string;

  @IsEmail()
  email: string;
}
