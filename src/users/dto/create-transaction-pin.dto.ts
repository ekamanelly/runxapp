import { IsNumber, IsString } from 'class-validator';

export class CreateTransactionPinDto {
  //   @Length(4, 4, { message: 'Pin must be exactly 4 digits long' })
  @IsString()
  pin: string;
}
