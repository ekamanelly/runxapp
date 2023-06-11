import { ProposalStatus } from 'src/proposal/proposal.interface';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsDate,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { toNumber } from 'src/common/utils';
import { OrderBy } from 'src/common/interface';

export class SPJobQueryDto {
  @Transform(({ value }) => ProposalStatus[value])
  @IsEnum(ProposalStatus)
  @IsOptional()
  status: ProposalStatus;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  limit: number = 10;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  start_date: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  end_date: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  date: Date;

  @IsOptional()
  @IsUUID()
  service_type: string;

  @IsEnum(OrderBy)
  @IsOptional()
  order_by: OrderBy = OrderBy.ASC;
}
