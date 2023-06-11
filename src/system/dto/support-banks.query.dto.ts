import { IsEnum } from 'class-validator';
import { SupportedCountries } from '../system.interface';

export class SupportedBankQueryDto {
  @IsEnum(SupportedCountries)
  country: SupportedCountries;
}
