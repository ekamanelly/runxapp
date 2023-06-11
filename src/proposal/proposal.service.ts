import { InitProposalDto } from './dto/init-proposal.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EmailTemplate } from 'src/common/email-template';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import {
  generateAlphaNumeric,
  normalizeEnum,
  paginateArray,
} from 'src/common/utils';
import { Proposal } from 'src/entities/proposal.entity';
import { User } from 'src/entities/user.entity';
import { CatchErrorException } from 'src/exceptions';
import { MessagingService } from 'src/messaging/messaging.service';
import { NotificationType } from 'src/notification/interface/notification.interface';
import { NotificationService } from 'src/notification/notification.service';
import { CompleteProposalDto } from 'src/proposal/dto/complete-proposal.dto';
import { ProposalCount, ProposalStatus } from 'src/proposal/proposal.interface';
import { getMillisecondsDifference } from 'src/service-request/service-request.util';
import { WalletService } from 'src/wallet/wallet.service';
import { EntityManager, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import {
  PROPOSAL_FEILDS,
  PROPOSAL_QUEUE,
  START_PROPOSAL_PROCESS,
} from './proposal.constant';
import { Queue } from 'bull';
import {
  ClientInvoice,
  InvoiceStatus,
  StartProposalJob,
} from './proposal.interface';
import { AcceptProposalDto } from './dto/accept-proposal.dto';
import { SendProposalDto } from './dto/send-proposal.dto';
import { SystemService } from 'src/system/system.service';
import { ServiceRequestService } from 'src/service-request/service-request.service';
import { PayServiceProviderDto } from './dto/pay-sp.dto';
import { UsersService } from 'src/users/users.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ActionCreator, PaginationResponse } from 'src/common/interface';
import { ClientServiceRequestQueryDto } from 'src/service-request/dto/client-service-request.dto';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { stripJob } from 'src/service-provider/service-provider.util';
import { SPJobQueryDto } from 'src/service-request/dto/sp-job.query.dto';
import { ServiceProviderCancelProposalDto } from './dto/sp-cancel-proposal.dto';
import { ClientCancelProposalDto } from './dto/client-cancel-proposal.dto';

@Injectable()
export class ProposalService {
  getClientStats(): ProposalCount | PromiseLike<ProposalCount> {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Proposal)
    private proposalRepo: Repository<Proposal>,
    private readonly messagingService: MessagingService,
    private readonly walletService: WalletService,
    private readonly notificationService: NotificationService,
    @InjectQueue(PROPOSAL_QUEUE)
    private proposalQueue: Queue<StartProposalJob>,
    private readonly systemService: SystemService,
    private readonly serviceRequestService: ServiceRequestService,
    private readonly userService: UsersService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  validateProposal(
    proposal: Proposal,
    client?: string,
    serviceProvider?: string,
    showError: boolean = true,
  ) {
    if (!proposal)
      if (!proposal) {
        throw new NotFoundException('Service request not found');
      }
    if (client && proposal.service_request.created_by.id !== client) {
      if (showError) {
        throw new NotFoundException('Proposal was not created by this client');
      } else {
        return false;
      }
    }
    if (serviceProvider && proposal.service_provider.id !== serviceProvider) {
      if (showError) {
        throw new NotFoundException(
          'Service provider is not associated with this proposal',
        );
      } else {
        return false;
      }
    }
    return true;
  }

  //TODO: remove method
  async getProposalBySRSP(serviceRequestId: string, serviceProviderId: string) {
    try {
      const proposal = await this.proposalRepo
        .createQueryBuilder('proposal')
        .leftJoinAndSelect('proposal.service_provider', 'sp')
        .leftJoinAndSelect('proposal.service_request', 'sr')
        .leftJoinAndSelect('sr.service_types', 'st')
        .leftJoinAndSelect('sr.created_by', 'created_by')
        .where('sr.id = :serviceRequestId AND sp.id = :serviceProviderId', {
          serviceRequestId,
          serviceProviderId,
        })
        .getOne();
      if (!proposal) {
        throw new NotFoundException(
          'Request not found for this service provider',
        );
      }
      return proposal;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  // TODO:remove method
  async getProposalsByRequestId(serviceRequestId: string) {
    try {
      return this.proposalRepo
        .createQueryBuilder('proposal')
        .leftJoinAndSelect('proposal.service_request', 'sr')
        .leftJoinAndSelect('proposal.service_provider', 'sp')
        .where('sr.id = :id', { id: serviceRequestId })
        .select([
          'proposal.id',
          'sr.id',
          'sp.last_name',
          'sp.first_name',
          'sp.id',
        ])
        .getMany();
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async updateProposals(proposals: Proposal[]) {
    this.proposalRepo.save(proposals);
  }

  async initProposal(currentUser: User, initProposalDto: InitProposalDto) {
    const { service_request_id } = initProposalDto;
    const systemData = await this.systemService.getSystem();
    const proposal = await this.getProposalBySRSP(
      service_request_id,
      currentUser.id,
    );
    if (proposal.invoice_id) {
      return {
        invoice_number: proposal.invoice_id,
        sp_service_fee: systemData.sp_service_fee,
      };
    } else {
      const invoice_number = await this.generateInvoiceNumber();
      proposal.invoice_id = invoice_number;
      const updatedProposal = await this.proposalRepo.save(proposal);
      return {
        invoice_number: updatedProposal.invoice_id,
        sp_service_fee: systemData.sp_service_fee,
      };
    }
  }

  async generateInvoiceNumber() {
    try {
      let invoiceNumber = null;
      do {
        const invoiceId = generateAlphaNumeric(8);
        const existing = await this.proposalRepo.findOne({
          where: { invoice_id: invoiceId },
        });
        if (existing) {
          return;
        }
        invoiceNumber = invoiceId;
      } while (invoiceNumber == null);
      return invoiceNumber;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getProposalById(proposalId: string, shallow = true, throwError = true) {
    try {
      const qb = await this.proposalRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.service_provider', 'sp')
        .leftJoinAndSelect('p.service_request', 'sr')
        .leftJoinAndSelect('p.sp_rating', 'sp_rating')
        .leftJoinAndSelect('p.client_rating', 'client_rating')
        .leftJoinAndSelect('sr.service_types', 'st')
        .leftJoinAndSelect('sr.created_by', 'user')
        .where('p.id = :id', { id: proposalId });
      if (shallow) {
        await qb.select(PROPOSAL_FEILDS);
      }
      const proposal = await qb.getOne();
      if (!proposal && throwError) {
        throw new NotFoundException('Job not found');
      }
      return proposal;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async sendProposal(currentUser: User, sendProposalDto: SendProposalDto) {
    try {
      const { amount, service_request_id, service_fee } = sendProposalDto;
      const { sp_service_fee, client_service_fee } =
        await this.systemService.getSystem();
      const proposal = await this.getProposalBySRSP(
        service_request_id,
        currentUser.id,
      );
      const serviceRequest = proposal.service_request;
      const serviceProvider = proposal.service_provider;
      const serviceTypes = serviceRequest.service_types;
      const client = serviceRequest.created_by;
      const minServiceFee = serviceTypes.reduce(
        (prev, current) =>
          prev < current.min_service_fee ? prev : current.min_service_fee,
        serviceTypes[0].min_service_fee,
      );
      if (amount < minServiceFee) {
        throw new HttpException(
          `The minimum service fee for ${
            serviceTypes.length > 1 ? 'these' : 'this'
          } service ${
            serviceTypes.length > 1 ? 'types' : 'type'
          } is ${minServiceFee}NGN`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!proposal.invoice_id) {
        throw new HttpException(
          'Initialise invoice before sending proposal',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (proposal.proposal_sent_date) {
        throw new HttpException(
          'Proposal already sent to client',
          HttpStatus.BAD_REQUEST,
        );
      }
      proposal.proposal_sent_date = new Date();
      proposal.sp_proposal_amount = amount;
      proposal.service_request = serviceRequest;
      proposal.client_service_fee = client_service_fee;
      proposal.sp_service_fee = sp_service_fee;

      await this.proposalRepo.save(proposal);
      //send sample email to client
      await this.messagingService.sendEmail(
        EmailTemplate.sendProposal({
          email: client.email,
          firstName: client.first_name,
          serviceRequest,
          sp: serviceProvider,
        }),
      );
      //send Notification
      await this.notificationService.sendNotification({
        type: NotificationType.SERVICE_REQUEST_PROPOSAL,
        service_provider: serviceProvider,
        service_request: serviceRequest,
        subject: 'You have a new service request from a Client',
        owner: client,
      });
      //send to chat
      return new ResponseMessage('Proposal successfully sent');
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async acceptProposal(
    currentUser: User,
    acceptProposalDto: AcceptProposalDto,
  ) {
    try {
      const { service_provider_id, service_request_id, pin } =
        acceptProposalDto;
      const proposal = await this.getProposalBySRSP(
        service_request_id,
        service_provider_id,
      );
      const serviceRequest = proposal.service_request;
      const serviceProvider = proposal.service_provider;
      const client = proposal.service_request.created_by;
      if (client.id !== currentUser.id) {
        return new HttpException(
          'You are not the owner of the service request',
          HttpStatus.BAD_REQUEST,
        );
      }

      // check service request in progress
      if (
        ['COMPLETED', 'PENDING', 'AWAITING_PAYMENT', 'IN_PROGRESS'].includes(
          proposal.status,
        )
      ) {
        throw new HttpException(
          `Service request already ${normalizeEnum(proposal.status)}`,
          HttpStatus.CONFLICT,
        );
      }

      if (!proposal.proposal_sent_date) {
        return new HttpException(
          'Service provider have not sent proposal yet',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (proposal.status === ProposalStatus.CANCELLED) {
        return new HttpException(
          `Proposal already cancelled by ${
            proposal.cancelled_by === ActionCreator.CLIENT
              ? 'you'
              : 'Service provider'
          }`,
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.userService.validateTransactionPin(currentUser, pin);
      // accept proposal wallet action
      return this.entityManager.transaction(async (transactionManager) => {
        await this.walletService.acceptProposal(
          client,
          serviceProvider,
          proposal,
          transactionManager,
        );
        proposal.proposal_accept_date = new Date();
        proposal.status = ProposalStatus.PENDING;
        proposal.service_request = serviceRequest;
        await transactionManager.getRepository(Proposal).save(proposal);
        //send sample email to service provider
        await this.messagingService.sendEmail(
          EmailTemplate.acceptProposal({
            email: serviceProvider.email,
            firstName: serviceProvider.first_name,
            serviceRequest,
            client,
          }),
        );
        //send Notification
        await this.notificationService.sendNotification({
          type: NotificationType.SERVICE_REQUEST_PROPOSAL,
          service_provider: serviceProvider,
          service_request: serviceRequest,
          subject: 'Your Service Request Proposal has been accepted by Client',
          owner: serviceProvider,
        });
        const delay = getMillisecondsDifference(serviceRequest.start_date);
        // send start proposal to queue
        await this.proposalQueue.add(
          START_PROPOSAL_PROCESS,
          {
            proposalId: proposal.id,
            serviceRequestId: serviceRequest.id,
          },
          { delay: delay },
        );
        return new ResponseMessage(
          'Service request proposal accepted successfully',
        );
      });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async clientCancelProposal(
    currentUser: User,
    cancelProposalDto: ClientCancelProposalDto,
  ) {
    const { service_provider_id, id, proposal_cancel_reason } =
      cancelProposalDto;
    const proposal = await this.getProposalById(id, false);
    // this.validateProposal(proposal, currentUser.id, service_provider_id);
    // if (proposal.status !== ProposalStatus.PENDING) {
    //   throw new HttpException(
    //     'you can only cancel proposal that is pending',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    const serviceProvider = proposal.service_provider;
    const serviceRequest = proposal.service_request;
    const startDate = new Date(proposal.service_request.start_date);
    const now = new Date();
    const diff = startDate.getTime() - now.getTime(); // Difference in milliseconds
    const isLessThan24Hours = diff < 24 * 60 * 60 * 1000;
    return await this.entityManager.transaction(async (transactionManager) => {
      await this.walletService.clientCancelProposal(
        currentUser,
        proposal.service_provider,
        proposal,
        isLessThan24Hours,
        transactionManager,
      );

      proposal.status = ProposalStatus.CANCELLED;
      proposal.cancel_reason = proposal_cancel_reason;
      proposal.cancelled_by = ActionCreator.CLIENT;
      proposal.cancel_date = new Date();
      await transactionManager.getRepository(Proposal).save(proposal);
      //send Notification
      await this.notificationService.sendNotification({
        type: NotificationType.CLIENT_CANCELLED_PROPOSAL,
        service_provider: serviceProvider,
        service_request: serviceRequest,
        subject: 'Client cancelled service request',
        owner: serviceProvider,
      });
      //send sample email to client
      await this.messagingService.sendEmail(
        EmailTemplate.cancelledProposal({
          email: serviceProvider.email,
          firstName: serviceProvider.first_name,
          cancelReason: proposal_cancel_reason,
          serviceRequest,
          actionCreator: ActionCreator.CLIENT,
        }),
      );
      return new ResponseMessage(
        'You have sucessfully cancelled this service request',
      );
    });
  }

  async updateProposalByTransaction(
    proposal: Proposal,
    transactionEntityManage: EntityManager,
  ) {
    return await transactionEntityManage.transaction(
      async (transactionManager) => {
        console.log({ transactionManager });
        // return await transactionManager.getRepository(Proposal).save(proposal);
      },
    );
  }

  async serviceProviderCancelProposal(
    currentUser: User,
    cancelProposalDto: ServiceProviderCancelProposalDto,
  ) {
    try {
      const { id, proposal_cancel_reason } = cancelProposalDto;
      const proposal = await this.getProposalById(id, false);
      await this.validateProposal(proposal, undefined, currentUser.id);
      if (
        ![ProposalStatus.PENDING, ProposalStatus.IN_PROGRESS].includes(
          proposal.status,
        )
      ) {
        throw new HttpException(
          'you can only cancel proposal that is pending or in progress',
          HttpStatus.BAD_REQUEST,
        );
      }
      const serviceProvider = currentUser;
      const client = proposal.service_request.created_by;
      const serviceRequest = proposal.service_request;

      return await this.entityManager.transaction(
        async (transactionManager) => {
          await this.walletService.serviceProviderCancelProposal(
            client,
            proposal.service_provider,
            proposal,
            transactionManager,
          );
          proposal.status = ProposalStatus.CANCELLED;
          proposal.cancel_reason = proposal_cancel_reason;
          proposal.cancel_date = new Date();
          proposal.cancelled_by = ActionCreator.SERVICE_PROVIDER;
          await transactionManager.getRepository(Proposal).save(proposal);
          //send Notification
          await this.notificationService.sendNotification({
            type: NotificationType.SP_CANCELLED_PROPOSAL,
            service_provider: serviceProvider,
            service_request: serviceRequest,
            subject: 'Service provider cancelled service request',
            owner: client,
          });
          //send sample email to client
          await this.messagingService.sendEmail(
            EmailTemplate.cancelledProposal({
              email: serviceProvider.email,
              firstName: serviceProvider.first_name,
              cancelReason: proposal_cancel_reason,
              serviceRequest,
              actionCreator: ActionCreator.SERVICE_PROVIDER,
            }),
          );

          return new ResponseMessage(
            'You have sucessfully cancelled this service request',
          );
        },
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async completeProposal(
    currentUser: User,
    completeProposalDto: CompleteProposalDto,
  ) {
    const {
      job_complete_note,
      job_complete_file_1,
      job_complete_file_2,
      job_complete_file_3,
      job_complete_file_4,
      job_complete_file_5,
      job_complete_file_6,
      service_request_id,
    } = completeProposalDto;

    const proposal = await this.getProposalBySRSP(
      service_request_id,
      currentUser.id,
    );
    const serviceRequest = proposal.service_request;
    // check if proposal have been accepted by service provider
    if (!proposal.proposal_accept_date) {
      return new HttpException(
        'You can only complete a service request that a client have accepted',
        HttpStatus.CONFLICT,
      );
    }
    // check if proposal has started
    if (proposal.status !== ProposalStatus.IN_PROGRESS) {
      return new HttpException(
        'You can only complete a service request in progress',
        HttpStatus.CONFLICT,
      );
    }

    const serviceProvider = proposal.service_provider;
    const client = proposal.service_request.created_by;
    return await this.entityManager.transaction(async (transactionManager) => {
      // wallet transactin
      await this.walletService.completeProposal(
        client,
        serviceProvider,
        proposal,
        transactionManager,
      );
      // update proposal
      proposal.service_request = serviceRequest;
      proposal.job_complete_note = job_complete_note;
      proposal.job_complete_file_1 = job_complete_file_1;
      proposal.job_complete_file_2 = job_complete_file_2;
      proposal.job_complete_file_3 = job_complete_file_3;
      proposal.job_complete_file_4 = job_complete_file_4;
      proposal.job_complete_file_5 = job_complete_file_5;
      proposal.job_complete_file_6 = job_complete_file_6;
      proposal.job_complete_date = new Date();
      proposal.status = ProposalStatus.AWAITING_PAYMENT;

      await transactionManager.getRepository(Proposal).save(proposal);

      //send Notification
      await this.notificationService.sendNotification({
        type: NotificationType.PROPOSAL_COMPLETE,
        service_provider: serviceProvider,
        service_request: serviceRequest,
        subject: 'Service Request has been completed by Service provider',
        owner: client,
      });

      //send sample email to client
      await this.messagingService.sendEmail(
        EmailTemplate.completeProposal({
          serviceProvider: serviceProvider,
          serviceRequest,
          client,
        }),
      );
      return new ResponseMessage(
        'Service request have been marked as completed await client to release payment',
      );
    });
  }

  async payServiceProvider(
    currentUser: User,
    payServiceProviderDto: PayServiceProviderDto,
  ) {
    const { service_provider_id, service_request_id, pin } =
      payServiceProviderDto;
    const proposal = await this.getProposalBySRSP(
      service_request_id,
      service_provider_id,
    );

    const serviceProvider = proposal.service_provider;
    const serviceRequest = proposal.service_request;
    const client = proposal.service_request.created_by;

    if (client.id !== currentUser.id) {
      return new HttpException(
        'You are not the owner of the service request',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!proposal.job_complete_date) {
      return new HttpException(
        'You can only make payment when service provider mark job as completed',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!proposal.job_complete_date) {
      return new HttpException(
        'You can only make payment when service provider mark job as completed',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (proposal.amount_paid_date) {
      return new HttpException(
        'Service provider already paid',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.userService.validateTransactionPin(currentUser, pin);
    return await this.entityManager.transaction(async (transactionManager) => {
      await this.walletService.payServiceProvider(
        client,
        serviceProvider,
        proposal,
        transactionManager,
      );

      proposal.amount_paid_date = new Date();
      proposal.status = ProposalStatus.COMPLETED;
      await transactionManager.getRepository(Proposal).save(proposal);
      // send Notification
      await this.notificationService.sendNotification({
        type: NotificationType.CLIENT_RELEASED_FUND,
        service_provider: serviceProvider,
        service_request: serviceRequest,
        subject:
          'Service Request has been started aceeptte as completed and your fund has been paid',
        owner: serviceProvider,
      });

      //send email to service provider
      await this.messagingService.sendEmail(
        EmailTemplate.fundReleasedByClient({
          email: serviceProvider.email,
          serviceRequest,
          sp: serviceProvider,
          firstName: serviceProvider.first_name,
        }),
      );
      return new ResponseMessage('Service provider successfully paid');
    });
  }
  async startProposal(proposalId: string): Promise<void> {
    try {
      const proposal = await this.getProposalById(proposalId, false);
      const {
        service_provider: serviceProvider,
        service_request: serviceRequest,
      } = proposal;
      const client = serviceRequest.created_by;
      proposal.status = ProposalStatus.IN_PROGRESS;
      await this.proposalRepo.save(proposal);
      const notifications = [
        {
          type: NotificationType.PROPOSAL_STARTED,
          service_provider: serviceProvider,
          service_request: serviceRequest,
          subject: 'Service Request have started',
          owner: serviceProvider,
        },
        {
          type: NotificationType.PROPOSAL_STARTED,
          service_provider: serviceProvider,
          service_request: serviceRequest,
          subject: 'Service Request have started',
          owner: client,
        },
      ];
      const emails = [
        EmailTemplate.startProposal({
          serviceRequest,
          user: client,
        }),
        ,
        EmailTemplate.startProposal({
          serviceRequest,
          user: serviceProvider,
        }),
      ];
      await Promise.all([
        this.notificationService.sendNotifications(notifications),
        Promise.all(
          emails.map((template) => this.messagingService.sendEmail(template)),
        ),
      ]);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
  async clientProposalInvoices(
    currentUser: User,
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginationResponse<ClientInvoice>> {
    try {
      const { limit, page } = paginationQueryDto;
      const proposals = await this.proposalRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.service_request', 'sr')
        .leftJoinAndSelect('sr.created_by', 'client')
        .leftJoinAndSelect('p.service_provider', 'sp')
        .where('client.id = :id', { id: currentUser.id })
        .getMany();
      let invoices: ClientInvoice[] = [];
      for (let i = 0; i < proposals.length; i++) {
        const p = proposals[i];
        if (p.invoice_id) {
          invoices.push({
            invoice_id: p.invoice_id,
            service_provider: {
              first_name: p.service_provider.first_name,
              last_name: p.service_provider.last_name,
              id: p.service_provider.id,
            },
            status: p.amount_paid_date
              ? InvoiceStatus.PAID
              : p.proposal_accept_date
              ? InvoiceStatus.ESCROW
              : InvoiceStatus.UNPAID,
            date_paid: p.amount_paid_date,
            created_at: p.proposal_sent_date,
            service_address: p.service_request.start_add,
            proposal_id: p.id,
            sp_service_fee: p.sp_service_fee,
            client_service_fee: p.client_service_fee,
            sp_proposal_amount: p.sp_proposal_amount,
            paid_date: p.amount_paid_date,
          });
        }
      }

      // Sort invoices by paid_date or created_at
      invoices.sort((a, b) => {
        if (a.paid_date && b.paid_date) {
          return a.paid_date.getTime() - b.paid_date.getTime();
        } else if (a.paid_date) {
          return -1;
        } else if (b.paid_date) {
          return 1;
        } else {
          return a.created_at.getTime() - b.created_at.getTime();
        }
      });

      return await paginateArray<ClientInvoice>(invoices, limit, page);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getClientJobCount(user: User): Promise<ProposalCount> {
    const proposals = await this.proposalRepo
      .createQueryBuilder('p')
      .leftJoin('p.service_request', 'sr')
      .where('sr.created_by.id = :id', {
        id: user.id,
      })
      .getMany();
    return await this.getProposalCount(proposals);
  }

  async getServiceProviderJobCount(user: User): Promise<ProposalCount> {
    const proposals = await this.proposalRepo
      .createQueryBuilder('p')
      .leftJoin('p.service_request', 'sr')
      .leftJoin('p.service_provider', 'sp')
      .where('sp.id = :id', {
        id: user.id,
      })
      .getMany();

    return await this.getProposalCount(proposals);
  }

  async getProposalCount(proposals: Proposal[]): Promise<ProposalCount> {
    const count: ProposalCount = {
      invited: 0,
      pending: 0,
      awaitingPayment: 0,
      completed: 0,
      inProgress: 0,
      cancelled: 0,
    };

    proposals.forEach((p) => {
      switch (p.status) {
        case ProposalStatus.INVITED:
          count.invited += 1;
          break;

        case ProposalStatus.PENDING:
          count.pending += 1;
          break;

        case ProposalStatus.AWAITING_PAYMENT:
          count.awaitingPayment += 1;
          break;

        case ProposalStatus.COMPLETED:
          count.completed += 1;
          break;

        case ProposalStatus.IN_PROGRESS:
          count.inProgress += 1;
          break;

        case ProposalStatus.CANCELLED:
        case ProposalStatus.DECLINED:
        case ProposalStatus.CANCELLED_INVITE:
          count.cancelled += 1;
          break;
        default:
          break;
      }
    });

    return count;
  }

  async getClientJobs(
    user: User,
    query: ClientServiceRequestQueryDto,
  ): Promise<Pagination<Proposal>> {
    try {
      const { status, page, limit, order_by } = query;
      const qb = this.proposalRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.service_provider', 'sp')
        .leftJoinAndSelect('p.service_request', 'sr')
        .leftJoinAndSelect('sr.service_types', 'st')
        .leftJoinAndSelect('p.client_rating', 'client_rating')
        .leftJoinAndSelect('p.sp_rating', 'sp_rating')
        .leftJoin('sr.created_by', 'user')
        .where('user.id = :id', {
          id: user.id,
        })
        .orderBy('p.created_at', order_by)
        .select(PROPOSAL_FEILDS);
      if (status) {
        await qb.andWhere(`p.status IN (:...statuses)`, {
          statuses: [
            status,
            ...(status === ProposalStatus.CANCELLED
              ? [ProposalStatus.CANCELLED_INVITE, ProposalStatus.DECLINED]
              : []),
          ],
        });
      }
      return await paginate<Proposal>(qb, { page, limit });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async serviceProviderJobOverview(currentUser: User) {
    try {
      const queryBuilder = this.proposalRepo.createQueryBuilder('p');
      const qb = await queryBuilder
        .leftJoinAndSelect('p.service_provider', 'sp')
        .leftJoinAndSelect('p.service_request', 'sr')
        .leftJoinAndSelect('sr.service_types', 'st')
        .leftJoinAndSelect('sr.created_by', 'created_by')
        .where('sp.id = :id', { id: currentUser.id });

      const inProgress = await qb
        .andWhere(`p.status = :status`, {
          status: ProposalStatus.IN_PROGRESS,
        })
        .getManyAndCount();
      const pending = await qb
        .clone()
        .andWhere(`p.status = :status`, {
          status: ProposalStatus.PENDING,
        })
        .getManyAndCount();
      const invited = await qb
        .clone()
        .andWhere(`p.status = :status`, {
          status: ProposalStatus.INVITED,
        })
        .getManyAndCount();
      const awaitingPayment = await qb
        .clone()
        .andWhere(`p.status = :status`, {
          status: ProposalStatus.AWAITING_PAYMENT,
        })
        .getManyAndCount();

      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0, // Set hours to 0
        0, // Set minutes to 0
        0, // Set seconds to 0
        0, // Set milliseconds to 0
      );
      const todayEnd = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23, // Set hours to 23
        59, // Set minutes to 59
        59, // Set seconds to 59
        999, // Set milliseconds to 999
      );

      const todayScheduleQb = this.proposalRepo.createQueryBuilder('p');
      const todaySchedule = await todayScheduleQb
        .leftJoinAndSelect('p.service_provider', 'sp')
        .leftJoinAndSelect('p.service_request', 'sr')
        .leftJoinAndSelect('sr.service_types', 'st')
        .leftJoinAndSelect('sr.created_by', 'created_by')
        .where(`sr.start_date BETWEEN :start AND :end`, {
          start: todayStart,
          end: todayEnd,
        })
        .andWhere('p.status IN (:...statuses)', {
          statuses: [ProposalStatus.IN_PROGRESS, ProposalStatus.PENDING],
        })
        .getManyAndCount();

      return {
        todaySchedule: {
          count: 0,
          data: [],
        },
        inProgress: {
          count: inProgress[1],
          data: inProgress[0]?.map((i) => stripJob(i)) || [],
        },
        invited: {
          count: invited[1],
          data: invited[0]?.map((i) => stripJob(i)) || [],
        },
        pending: {
          count: pending[1],
          data: pending[0]?.map((i) => stripJob(i)) || [],
        },
        awaitingPayment: {
          count: awaitingPayment[1],
          data: awaitingPayment[0]?.map((i) => stripJob(i)) || [],
        },
      };
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getServiceProviderJobs(
    user: User,
    query: SPJobQueryDto,
  ): Promise<Pagination<any>> {
    const {
      status,
      page,
      limit,
      start_date,
      end_date,
      date,
      service_type,
      order_by,
    } = query;
    const qb = await this.proposalRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.service_request', 'sr')
      .leftJoinAndSelect('p.service_provider', 'sp')
      .leftJoinAndSelect('sr.service_types', 'st')
      .leftJoinAndSelect('sr.created_by', 'client')
      .where('sp.id = :id', { id: user.id })
      .orderBy('p.created_at', order_by);
    if (status) {
      await qb.andWhere(`p.status IN (:...statuses)`, {
        statuses: [
          status,
          ...(status === ProposalStatus.CANCELLED
            ? [ProposalStatus.CANCELLED_INVITE, ProposalStatus.DECLINED]
            : []),
        ],
      });
    }
    if (service_type) {
      await qb.andWhere(`st.id = :serviceTypeId`, {
        serviceTypeId: service_type,
      });
    }

    if (start_date && end_date) {
      await qb.andWhere(`sr.start_date BETWEEN :startDate AND :endDate`, {
        start_date,
        end_date,
      });
    } else if (date) {
      await qb.andWhere(`DATE(sr.start_date) = :date`, { date });
    }
    const res = await paginate<Proposal>(qb, {
      page,
      limit,
    });
    return {
      ...res,
      items: res.items.map((p) => ({
        id: p.id,
        service_request_id: p.service_request.id,
        sp_proposal_amount: p.sp_proposal_amount,
        description: p.service_request.description,
        start_add: p.service_request.start_add,
        start_date: p.service_request.start_date,
        sp_service_fee: p.sp_service_fee,
        status: p.status,
        created_at: p.created_at,
        service_request_types: p.service_request.service_types.map((i) => ({
          name: i.name,
          id: i.id,
        })),
        created_by: {
          first_name: p.service_request.created_by.first_name,
          last_name: p.service_request.created_by.last_name,
          id: p.service_request.created_by.id,
        },
      })),
    };
  }
}
