import {
  SMS_MESSAGEING_QUEUE,
  EMAIL_MESSAGEING_QUEUE,
} from './messaging.constant';
import { BullModule } from '@nestjs/bull';
import { EmailConsumer } from './queue/email.consumer';
import { SMSConsumer } from './queue/sms.consumer';
import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: SMS_MESSAGEING_QUEUE },
      { name: EMAIL_MESSAGEING_QUEUE },
    ),
  ],
  providers: [MessagingService, SMSConsumer, EmailConsumer],
  exports: [MessagingService],
})
export class MessagingModule {}
