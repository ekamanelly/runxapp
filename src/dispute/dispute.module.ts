import { Module } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { DisputeController } from './dispute.controller';
import { DisputeConsumer } from './dispute.consumer';
import { BullModule } from '@nestjs/bull';
import { DISPUTE_QUEUE } from './dispute.constatnt';
import { ProposalModule } from 'src/proposal/proposal.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { NotificationModule } from 'src/notification/notification.module';
import { MessagingModule } from 'src/messaging/messaging.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: DISPUTE_QUEUE }),
    ProposalModule,
    WalletModule,
    NotificationModule,
    MessagingModule,
  ],
  controllers: [DisputeController],
  providers: [DisputeService, DisputeConsumer],
  exports: [DisputeService],
})
export class DisputeModule {}
