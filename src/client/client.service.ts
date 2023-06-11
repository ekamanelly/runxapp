import { Injectable } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Proposal } from 'src/entities/proposal.entity';
import { User } from 'src/entities/user.entity';
import { ProposalCount } from 'src/proposal/proposal.interface';
import { ProposalService } from 'src/proposal/proposal.service';
import { ClientServiceRequestQueryDto } from 'src/service-request/dto/client-service-request.dto';

@Injectable()
export class ClientService {
  constructor(private readonly proposalService: ProposalService) {}

  async getClientJobCount(user: User): Promise<ProposalCount> {
    return await this.proposalService.getClientJobCount(user);
  }

  async getClientJobs(
    user: User,
    query: ClientServiceRequestQueryDto,
  ): Promise<Pagination<Proposal>> {
    return await this.proposalService.getClientJobs(user, query);
  }
}
