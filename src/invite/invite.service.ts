import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { serviceRequestInvitationEmailTemplate } from 'src/common/email-template/sr-invitation-email';
import { Proposal } from 'src/entities/proposal.entity';
import { ServiceRequest } from 'src/entities/service-request.entity';
import { User } from 'src/entities/user.entity';
import { CatchErrorException } from 'src/exceptions';
import { MessagingService } from 'src/messaging/messaging.service';
import { NotificationService } from 'src/notification/notification.service';
import { ProposalService } from 'src/proposal/proposal.service';
import { SendInvitesDto } from 'src/invite/dto/send-invites.dto';
import { ProposalStatus } from 'src/proposal/proposal.interface';
import { ServiceRequestService } from 'src/service-request/service-request.service';
import { UsersService } from 'src/users/users.service';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { DeclineInviteDto } from './dto/decline-invite.dto';
import { CancelInviteDto } from './dto/cancel-invite.dto';
import { ResponseMessage } from 'src/common/interface/success-message.interface';

@Injectable()
export class InviteService {
  constructor(
    private readonly userService: UsersService,
    private readonly proposalService: ProposalService,
    private readonly messagingService: MessagingService,
    private readonly serviceRequestService: ServiceRequestService,
    private readonly notificationService: NotificationService,
  ) {}

  async sendInvites(
    currentUser: User,
    sendServiceRequestInvitaionsDto: SendInvitesDto,
  ) {
    try {
      const {
        service_providers,
        service_request_id,
        description,
        service_types,
        start_add,
        start_state,
        start_city,
        end_add,
        end_state,
        end_city,
        start_date,
        end_date,
      } = sendServiceRequestInvitaionsDto;
      const serviceProviders = await this.userService.getUsersById(
        service_providers,
      );

      let serviceRequest: ServiceRequest | null = null;

      if (service_request_id) {
        serviceRequest = await this.serviceRequestService.getServiceRequestById(
          service_request_id,
        );
      } else {
        const newRequest = await this.serviceRequestService.create(
          {
            description,
            service_types,
            start_add,
            start_state,
            start_city,
            end_add,
            end_state,
            end_city,
            start_date,
            end_date,
          },
          currentUser,
        );
        serviceRequest = newRequest;
      }
      if (serviceProviders.length !== service_providers.length) {
        throw new HttpException(
          'service provider contains incorrect user id',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingProposals =
        await this.proposalService.getProposalsByRequestId(service_request_id);

      const existingUsers = existingProposals.map(
        (proposal) => proposal.service_provider.id,
      );
      const newUsers = serviceProviders.filter(
        (sp) => !existingUsers.includes(sp.id),
      );

      if (!newUsers.length) {
        throw new HttpException(
          'Service providers have already been invited',
          HttpStatus.CONFLICT,
        );
      }

      const proposals = newUsers.map((user) => {
        const proposal = new Proposal();
        proposal.service_provider = user;
        proposal.service_request = serviceRequest;
        proposal.status = ProposalStatus.INVITED;
        return proposal;
      });
      await this.proposalService.updateProposals(proposals);
      // send invitation email

      await this.notificationService.sendNotifications(
        newUsers.map((u) => ({
          message: `${serviceRequest.service_types.join(', ')} / ${
            serviceRequest.created_by.first_name
          }`,
          subject: 'You have a new job invite from a Client',
          owner: u,
          client: serviceRequest.created_by,
          service_request: serviceRequest,
        })),
      );

      for (const user of newUsers) {
        await this.messagingService.sendEmail(
          await serviceRequestInvitationEmailTemplate({
            serviceRequest,
            email: user.email,
            firstName: user.first_name,
            client: currentUser,
          }),
        );
      }

      return { message: 'Invitation successfully sent' };
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async acceptInvite(currentUser: User, acceptInviteDto: AcceptInviteDto) {
    const { service_request_id } = acceptInviteDto;
    const proposal = await this.proposalService.getProposalBySRSP(
      service_request_id,
      currentUser.id,
    );
    if (proposal.invite_cancel_date) {
      throw new HttpException(
        'Invite cancelled by client',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (proposal.invite_accept_date) {
      throw new HttpException(
        'Invite already accepted',
        HttpStatus.BAD_REQUEST,
      );
    }
    proposal.invite_accept_date = new Date();
    await this.proposalService.updateProposals([proposal]);
    return new ResponseMessage('Invite successfully accepted');
  }

  async declineInvite(currentUser: User, declineInviteDto: DeclineInviteDto) {
    const { service_request_id, invite_decline_reason } = declineInviteDto;
    const proposal = await this.proposalService.getProposalBySRSP(
      service_request_id,
      currentUser.id,
    );
    if (proposal.invite_cancel_date) {
      throw new HttpException(
        'Invite cancelled by client',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (proposal.invite_accept_date) {
      throw new HttpException(
        'You cannot decline accepted invite',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (proposal.invite_decline_date) {
      throw new HttpException(
        'Invite already declined',
        HttpStatus.BAD_REQUEST,
      );
    }
    proposal.invite_decline_date = new Date();
    proposal.invite_decline_reason = invite_decline_reason;
    proposal.status = ProposalStatus.DECLINED;
    await this.proposalService.updateProposals([proposal]);
    return new ResponseMessage('Invite successfully declined');
  }

  async cancelInvite(currentUser: User, cancelInviteDto: CancelInviteDto) {
    const { service_request_id, invite_cancel_reason, service_provider_id } =
      cancelInviteDto;
    const proposal = await this.proposalService.getProposalBySRSP(
      service_request_id,
      service_provider_id,
    );
    if (proposal.service_request.created_by.id !== currentUser.id) {
      throw new HttpException(
        'You can only cancel invites you sent',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (proposal.invite_cancel_date) {
      throw new HttpException(
        'Invite already cancelled',
        HttpStatus.BAD_REQUEST,
      );
    }
    proposal.invite_cancel_date = new Date();
    proposal.invite_cancel_reason = invite_cancel_reason;
    proposal.status = ProposalStatus.CANCELLED_INVITE;
    await this.proposalService.updateProposals([proposal]);
    return new ResponseMessage('Invite successfully cancelled');
  }
}
