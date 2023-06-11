import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { TransactionType } from '../interfaces/transaction.interface';

export class TransactionQueryDto extends PaginationQueryDto {
  @IsEnum(TransactionType)
  @IsOptional()
  type: TransactionType;
}
