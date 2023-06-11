import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import { CatchErrorException } from 'src/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalStatus } from 'src/proposal/proposal.interface';
import { User } from 'src/entities/user.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { ActionCreator, PaginationResponse } from 'src/common/interface';
import { ProposalService } from 'src/proposal/proposal.service';
import { normalizeEnum } from 'src/common/utils';
import { ClientRating } from 'src/entities/client-rating.entity';
import { SpRating } from 'src/entities/sp-rating.entity';
import { GetRatingQueryDto } from './dto/get-rating-query.dto';
import { MessagingService } from 'src/messaging/messaging.service';
import { EmailTemplate } from 'src/common/email-template';
import { NotificationType } from 'src/notification/interface/notification.interface';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(ClientRating)
    private readonly clientRatingRepo: Repository<ClientRating>,
    @InjectRepository(SpRating)
    private readonly spRatingRepo: Repository<SpRating>,
    private readonly proposalService: ProposalService,
    private readonly messagingService: MessagingService,
    private readonly notificationService: NotificationService,
  ) {}

  async createRating(currentUser: User, createRatingDto: CreateRatingDto) {
    try {
      const { proposal_id, star, review, reviewer } = createRatingDto;
      const proposal = await this.proposalService.getProposalById(
        proposal_id,
        false,
      );
      const client = proposal.service_request.created_by;
      const sp = proposal.service_provider;
      const isClientReviewer = reviewer == ActionCreator.CLIENT;
      const isSpReviewer = reviewer == ActionCreator.SERVICE_PROVIDER;
      // return proposal;
      await this.proposalService.validateProposal(
        proposal,
        isClientReviewer ? currentUser.id : undefined,
        isSpReviewer ? currentUser.id : undefined,
      );
      if (proposal.status !== ProposalStatus.COMPLETED) {
        throw new HttpException(
          'You can only rate a completed service',
          HttpStatus.CONFLICT,
        );
      }
      if (isClientReviewer && proposal.sp_rating) {
        throw new HttpException(
          `Rating already exist for service provider`,
          HttpStatus.CONFLICT,
        );
      }
      if (isSpReviewer && proposal.client_rating) {
        throw new HttpException(
          `Rating already exist for client`,
          HttpStatus.CONFLICT,
        );
      }
      if (isClientReviewer) {
        const spRating = await this.spRatingRepo.create({
          proposal,
          star,
          review,
          user: sp,
        });
        await this.spRatingRepo.save(spRating);

        // send email to sp
        const template = EmailTemplate.clientRating({
          email: sp.email,
          firstName: sp.first_name,
          rating: star,
        });
        await this.messagingService.sendEmail(template);
        //send Notification to sp
        await this.notificationService.sendNotification({
          type: NotificationType.RATING,
          subject: 'Client rated your completed Service',
          owner: sp,
        });
      }
      if (isSpReviewer) {
        const clientRating = await this.clientRatingRepo.create({
          proposal,
          star,
          review,
          user: client,
        });
        await this.clientRatingRepo.save(clientRating);
        // send email to client
        await this.messagingService.sendEmail(
          EmailTemplate.spRating({
            email: client.email,
            firstName: client.first_name,
            rating: star,
          }),
        );
        //send Notification to client
        await this.notificationService.sendNotification({
          type: NotificationType.RATING,
          subject: 'Service provided rated your completed Service',
          owner: client,
        });
      }

      return new ResponseMessage(
        `${
          isClientReviewer ? 'Service provider' : 'Client'
        } successfully reviewed`,
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getClientRatings(
    getRatingQueryDto: GetRatingQueryDto,
  ): PaginationResponse<ClientRating> {
    try {
      const { limit, page, user_id } = getRatingQueryDto;
      const qb = await this.clientRatingRepo
        .createQueryBuilder('r')
        .leftJoin('r.user', 'user')
        .where('user.id = :id', {
          id: user_id,
        });
      return paginate(qb, { limit, page });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getSpRatings(
    getRatingQueryDto: GetRatingQueryDto,
  ): PaginationResponse<SpRating> {
    try {
      const { limit, page, user_id } = getRatingQueryDto;
      const qb = await this.spRatingRepo
        .createQueryBuilder('r')
        .leftJoin('r.user', 'user')
        .where('user.id = :id', {
          id: user_id,
        });
      return paginate(qb, { limit, page });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
