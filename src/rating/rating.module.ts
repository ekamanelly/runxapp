import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { ServiceRequestModule } from 'src/service-request/service-request.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { ClientRating } from 'src/entities/client-rating.entity';
import { SpRating } from 'src/entities/sp-rating.entity';
import { MessagingModule } from 'src/messaging/messaging.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    ServiceRequestModule,
    TypeOrmModule.forFeature([SpRating, ClientRating]),
    UsersModule,
    ProposalModule,
    MessagingModule,
    NotificationModule,
  ],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
