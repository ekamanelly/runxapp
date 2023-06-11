import { Process, Processor } from '@nestjs/bull';
import { DisputeService } from './dispute.service';
import { DISPUTE_QUEUE, DISPUTE_RESOLUTION_PROCESS } from './dispute.constatnt';
import { ResolveDisputeQueueProcess } from './dispute.interface';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor(DISPUTE_QUEUE)
export class DisputeConsumer {
  private logger = new Logger(DisputeConsumer.name);
  constructor(private readonly disputeService: DisputeService) {}

  @Process(DISPUTE_RESOLUTION_PROCESS)
  async resolveDispute(job: Job<ResolveDisputeQueueProcess>) {
    console.log('resolveDispute consumer');
    this.logger.log(job);
    await this.disputeService.resolveDispute(job.data);
  }
}
