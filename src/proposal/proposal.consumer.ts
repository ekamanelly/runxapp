import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

import { ProposalService } from 'src/proposal/proposal.service';
import { StartProposalJob } from './proposal.interface';
import { PROPOSAL_QUEUE, START_PROPOSAL_PROCESS } from './proposal.constant';

@Processor(PROPOSAL_QUEUE)
export class ProposalConsumer {
  constructor(private readonly proposalService: ProposalService) {}
  private readonly logger = new Logger(ProposalConsumer.name);

  @Process(START_PROPOSAL_PROCESS)
  async startProposal(job: Job<StartProposalJob>) {
    await this.proposalService.startProposal(job.data.proposalId);
  }
}
