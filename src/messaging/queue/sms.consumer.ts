import { Logger } from '@nestjs/common';
import { SMS_MESSAGEING_QUEUE } from '../messaging.constant';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { SendSMSQueueJob } from '../interfaces/sms.interface';
const request = require('request');

@Processor(SMS_MESSAGEING_QUEUE)
export class SMSConsumer {
  private readonly logger = new Logger(SMSConsumer.name);
  constructor(private configService: ConfigService) {}
  @Process()
  async sendSMS(job: Job<SendSMSQueueJob>) {
    const { phoneNumber, smsBody } = job.data;
    var data = {
      to: phoneNumber,
      from: this.configService.get<string>('sms.from'),
      sms: smsBody,
      type: 'plain',
      api_key: this.configService.get<string>('sms.apiKey'),
      channel: 'generic',
    };
    var options = {
      method: 'POST',
      url: 'https://api.ng.termii.com/api/sms/send',
      headers: {
        'Content-Type': ['application/json', 'application/json'],
      },
      body: JSON.stringify(data),
    };
    this.logger.log(JSON.stringify(job));
    await request(options, function (error, response) {
      if (error) throw new Error(error);
      return response.body;
    });
  }
}
