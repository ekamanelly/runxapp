import { IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class GetRatingQueryDto extends PaginationQueryDto {
  @IsUUID()
  user_id: string;
}
