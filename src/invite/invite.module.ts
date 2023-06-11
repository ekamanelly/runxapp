import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { MessagingModule } from 'src/messaging/messaging.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { ServiceRequestModule } from 'src/service-request/service-request.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MessagingModule,
    NotificationModule,
    ProposalModule,
    ServiceRequestModule,
    UsersModule,
  ],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
