import { MessagingModule } from '../messaging/messaging.module';
import { NotificationModule } from '../notification/notification.module';
import { BullModule } from '@nestjs/bull';
import { User } from '../entities/user.entity';
import { UsersModule } from '../users/users.module';
import { ServiceTypesModule } from '../services-types/service-types.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequest } from '../entities/service-request.entity';
import { ServiceRequestService } from './service-request.service';
import { Proposal } from 'src/entities/proposal.entity';
import { NOTIFICATION_QUEUE } from 'src/notification/notification.constant';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest, User, Proposal]),
    ServiceTypesModule,
    NotificationModule,
    UsersModule,
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
    MessagingModule,
    WalletModule,
  ],
  controllers: [ServiceRequestController],
  providers: [ServiceRequestService],
  exports: [ServiceRequestService],
})
export class ServiceRequestModule {}
