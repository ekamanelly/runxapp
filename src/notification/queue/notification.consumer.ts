import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';
import { SendNotification } from '../interface/notification.interface';
import { NOTIFICATION_QUEUE } from '../notification.constant';

@Processor(NOTIFICATION_QUEUE)
export class NotificationConsumer {
  @Process()
  @OnQueueActive()
  async sendNotification(job: Job<SendNotification>) {}
}
