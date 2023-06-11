import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { toNumber } from '../utils';

export class PaginationQueryDto {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  limit: number = 10;
}
