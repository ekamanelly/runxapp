import { toNumber } from 'src/common/utils';
import { Transform } from 'class-transformer';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export class ResetTransactionPinDto {
  @IsString()

  // @MaxLength(4, { message: 'Pin must be exactly 4 digits' })
  pin: string;

  // @MaxLength(4, { message: 'Code must be exactly 4 digits' })
  @IsString()
  code: number;
}
