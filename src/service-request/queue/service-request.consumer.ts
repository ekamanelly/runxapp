// import {
//   START_PROPOSAL_PROCESS,
//   RESOLVE_DISPUTE_PROCESS,
// } from './../service-request.constant';
// import { Process, Processor } from '@nestjs/bull';
// import { Job } from 'bull';
// import { SERVICE_REQUEST_QUEUE } from '../service-request.constant';
// import { Logger } from '@nestjs/common';
// import {
//   ResolveDisputeQueueProcess,
//   StartServiceRequestJob,
// } from '../interfaces/service-requests.interface';
// import { ServiceRequestService } from '../service-request.service';
// import { ProposalService } from 'src/proposal/proposal.service';
// @Processor(SERVICE_REQUEST_QUEUE)
// export class ServiceRequestConsumer {
//   constructor(
//     private readonly serviceRequestsService: ServiceRequestService, // private readonly proposalService: ProposalService,
//   ) {}
//   private readonly logger = new Logger(ServiceRequestConsumer.name);
//   @Process(START_PROPOSAL_PROCESS)
//   async startServiceRequest(job: Job<StartServiceRequestJob>) {
//     // await this.proposalService.startProposal(job.data.proposalId);
//   }
//   }
// }
