import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { toBoolean, toNumber } from 'src/common/utils';
import { Gender } from 'src/users/interfaces/user.interface';

export class SearchServiceProviderQueryDto {
  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsOptional()
  city: string;

  @Transform(({ value }) => toNumber(value))
  @IsOptional()
  @IsNumber()
  price_from: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  price_to: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  rating: number;

  @Transform(({ value }) => Gender[value])
  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  profile_pic: boolean;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  limit: number = 10;

  @IsString()
  @IsOptional()
  service_types: string = '';
}
