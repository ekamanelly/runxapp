import { OrderBy } from 'src/common/interface';
import { ProposalStatus } from 'src/proposal/proposal.interface';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { toNumber } from 'src/common/utils';

export class ClientServiceRequestQueryDto {
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

  @IsEnum(OrderBy)
  order_by: OrderBy = OrderBy.DESC;
}
