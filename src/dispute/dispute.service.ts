import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailTemplate } from 'src/common/email-template';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import { normalizeEnum } from 'src/common/utils';
import { CatchErrorException } from 'src/exceptions';
import { NotificationType } from 'src/notification/interface/notification.interface';
import { ProposalService } from 'src/proposal/proposal.service';
import { RaiseDisputeDto } from 'src/dispute/dto/raise-dispute.dto';
import { ProposalStatus } from 'src/proposal/proposal.interface';
import {
  Disputant,
  DisputeResolveAction,
  DisputeResolver,
  DisputeStatus,
  ResolveDisputeQueueProcess,
} from './dispute.interface';
import { InjectQueue } from '@nestjs/bull';
import { DISPUTE_QUEUE, DISPUTE_RESOLUTION_PROCESS } from './dispute.constatnt';
import { Queue } from 'bull';
import { MessagingService } from 'src/messaging/messaging.service';
import { WalletService } from 'src/wallet/wallet.service';
import { NotificationService } from 'src/notification/notification.service';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class DisputeService {
  constructor(
    private readonly proposalService: ProposalService,
    @InjectQueue(DISPUTE_QUEUE)
    private readonly disputeQueue: Queue<ResolveDisputeQueueProcess>,
    private readonly messagingService: MessagingService,
    private readonly notificationService: NotificationService,
    private readonly walletService: WalletService,
    @InjectEntityManager()
    public readonly entityManager: EntityManager,
  ) {}

  async raiseDispute(currentUser: User, raiseDisputeDto: RaiseDisputeDto) {
    try {
      const {
        service_provider_id,
        disputant,
        dispute_reason,
        service_request_id,
      } = raiseDisputeDto;
      // return raiseDisputeDto;
      const proposal = await this.proposalService.getProposalBySRSP(
        service_request_id,

        service_provider_id,
      );
      const serviceProvider = proposal.service_provider;
      const serviceRequest = proposal.service_request;
      const client = proposal.service_request.created_by;

      if (disputant == Disputant.SERVICE_PROVIDER && !currentUser.is_sp) {
        throw new HttpException(
          `User must be service provider when disputant field is service provider`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (disputant == Disputant.CLIENT && !currentUser.is_client) {
        throw new HttpException(
          `User must be client when disputant field is client`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const canDisputeStatuses = [
        ProposalStatus.IN_PROGRESS,
        ProposalStatus.AWAITING_PAYMENT,
      ];
      if (
        disputant == Disputant.SERVICE_PROVIDER &&
        proposal.status !== ProposalStatus.AWAITING_PAYMENT
      ) {
        throw new HttpException(
          `Service provider can only raise dispute when service is awaiting payment`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (
        disputant == Disputant.CLIENT &&
        !canDisputeStatuses.includes(proposal.status)
      ) {
        throw new HttpException(
          `Client can only raise dispute when service request in progress or awaiting payment`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const disputeQueue = await this.disputeQueue.add(
        DISPUTE_RESOLUTION_PROCESS,
        {
          service_request_id,
          service_provider_id,
          dispute_resolve_action:
            disputant === Disputant.CLIENT
              ? DisputeResolveAction.REFUND_CLIENT
              : DisputeResolveAction.PAY_SERVICE_PROVIDER,
          dispute_resolve_reason:
            disputant === Disputant.CLIENT
              ? 'System refunded client after no query'
              : 'System paid service provider after no query',
          resolver: DisputeResolver.SYSTEM_QUEUE,
        },
        { delay: 60000 },
      );

      proposal.dispute_status = DisputeStatus.IN_PROGRESS;
      proposal.disputant = disputant;
      proposal.dispute_queue_id = disputeQueue.id as any;
      proposal.dispute_date = new Date();
      proposal.dispute_reason = dispute_reason;
      await this.proposalService.updateProposals([proposal]);

      // send Notification
      await this.notificationService.sendNotification({
        type: NotificationType.JOB_DISPUTE_RAISED,
        service_provider: serviceProvider,
        service_request: serviceRequest,
        subject:
          disputant === Disputant.SERVICE_PROVIDER
            ? 'Service Provider raised a dispute on your service request'
            : '',
        owner:
          disputant === Disputant.SERVICE_PROVIDER ? client : serviceProvider,
      });

      //send sample email to client
      await this.messagingService.sendEmail(
        EmailTemplate.raiseDispute({
          serviceProvider: serviceProvider,
          serviceRequest,
          client,
          disputant,
          disputeReason: dispute_reason,
        }),
      );
      return new ResponseMessage('Dispute successfully raised');
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async resolveDispute(resolveDisputeDto: ResolveDisputeDto) {
    try {
      console.log('resolve Dispute service', { resolveDisputeDto });

      return await this.entityManager.transaction(
        async (transactionManager) => {
          const {
            service_provider_id,
            dispute_resolve_action,
            dispute_resolve_reason,
            resolver,
            service_request_id,
          } = resolveDisputeDto;
          const proposal = await this.proposalService.getProposalBySRSP(
            service_request_id,
            service_provider_id,
          );
          const disputant = proposal.disputant;
          if (proposal.dispute_status !== DisputeStatus.IN_PROGRESS) {
            throw new HttpException(
              'Cannot resolve dispute not in progress',
              HttpStatus.BAD_REQUEST,
            );
          }
          if (resolver === DisputeResolver.ADMIN) {
            const queueJob = await this.disputeQueue.getJob(
              proposal.dispute_queue_id,
            );
            if (queueJob) {
              await queueJob.remove();
            }
          }

          proposal.dispute_resolve_date = new Date();
          proposal.dispute_resolve_reason = dispute_resolve_reason;
          proposal.dispute_resolve_action = dispute_resolve_action;
          proposal.dispute_resolver = resolver;
          proposal.dispute_status = DisputeStatus.SETTLED;
          proposal.status =
            dispute_resolve_action === DisputeResolveAction.PAY_SERVICE_PROVIDER
              ? ProposalStatus.COMPLETED
              : ProposalStatus.CANCELLED;
          await this.proposalService.updateProposalByTransaction(
            proposal,
            transactionManager,
          );

          const serviceProvider = proposal.service_provider;
          const serviceRequest = proposal.service_request;
          const client = proposal.service_request.created_by;

          // send notification
          await this.notificationService.sendNotification({
            type: NotificationType.JOB_DISPUTE_RESOLVED,
            service_provider: serviceProvider,
            service_request: serviceRequest,
            subject: 'Dispute has been resolved',
            disputant,
            owner:
              disputant === Disputant.SERVICE_PROVIDER
                ? client
                : serviceProvider,
          });

          //send sample email to client
          await this.messagingService.sendEmail(
            EmailTemplate.resolveDispute({
              user: client,
              serviceRequest,
            }),
          );

          //send sample email to service provider
          await this.messagingService.sendEmail(
            EmailTemplate.resolveDispute({
              user: serviceProvider,
              serviceRequest,
            }),
          );
          if (
            dispute_resolve_action === DisputeResolveAction.PAY_SERVICE_PROVIDER
          ) {
            await this.walletService.disputePayServiceProvider(
              client,
              serviceProvider,
              proposal,
              transactionManager,
            );
          }
          if (dispute_resolve_action === DisputeResolveAction.REFUND_CLIENT) {
            await this.walletService.disputeRefundClient(
              client,
              serviceProvider,
              proposal,
              transactionManager,
            );
          }

          return new ResponseMessage(
            `Dispute successfully resolved in favor of ${normalizeEnum(
              disputant,
            )}`,
          );
        },
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
