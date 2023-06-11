import { IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ProposalChatsDto extends PaginationQueryDto {
  @IsUUID()
  proposal_id: string;
}
