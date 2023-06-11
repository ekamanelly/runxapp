import { WalletModule } from 'src/wallet/wallet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';
import { Proposal } from 'src/entities/proposal.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { MessagingModule } from 'src/messaging/messaging.module';
import { BullModule } from '@nestjs/bull';
import { PROPOSAL_QUEUE } from './proposal.constant';
import { ProposalConsumer } from './proposal.consumer';
import { SystemModule } from 'src/system/system.module';
import { ServiceRequestModule } from 'src/service-request/service-request.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    NotificationModule,
    MessagingModule,
    TypeOrmModule.forFeature([Proposal]),
    WalletModule,
    BullModule.registerQueue({ name: PROPOSAL_QUEUE }),
    SystemModule,
    ServiceRequestModule,
    UsersModule,
  ],
  controllers: [ProposalController],
  providers: [ProposalService, ProposalConsumer],
  exports: [ProposalService],
})
export class ProposalModule {}
