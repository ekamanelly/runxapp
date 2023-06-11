import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { toBoolean } from 'src/common/utils';

export class ListUserQueryDto extends PaginationQueryDto {
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  is_sp: boolean = false;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  is_client: boolean = false;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  is_admin: boolean = false;
}
