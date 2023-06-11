import { SendSMSQueueJob } from './interfaces/sms.interface';
import {
  EMAIL_MESSAGEING_QUEUE,
  SMS_MESSAGEING_QUEUE,
} from './messaging.constant';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AnyNaptrRecord } from 'dns';
import { SendEmailQueueJob } from './interfaces/mail.interface';
const request = require('request');

@Injectable()
export class MessagingService {
  constructor(
    @InjectQueue(SMS_MESSAGEING_QUEUE)
    private readonly smsMessagingQueue: Queue<SendSMSQueueJob>,
    @InjectQueue(EMAIL_MESSAGEING_QUEUE)
    private readonly emailMessagingQueue: Queue<SendEmailQueueJob>,
  ) {}
  async sendSMS(phoneNumber: string, smsBody: string) {
    return await this.smsMessagingQueue.add({ phoneNumber, smsBody });
  }
  async sendEmail(emailContent: SendEmailQueueJob) {
    return await this.emailMessagingQueue.add(emailContent);
  }
}
