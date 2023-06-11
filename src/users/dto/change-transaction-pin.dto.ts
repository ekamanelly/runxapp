import { IsString } from 'class-validator';

export class ChangeTransactionPinDto {
  //   @Length(4, 4, { message: 'Pin must be exactly 4 digits long' })
  @IsString()
  old_pin: string;
  //   @Length(4, 4, { message: 'Pin must be exactly 4 digits long' })
  @IsString()
  new_pin: string;
}
