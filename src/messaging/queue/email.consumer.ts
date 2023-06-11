import { EMAIL_MESSAGEING_QUEUE } from '../messaging.constant';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SendEmailQueueJob } from '../interfaces/mail.interface';
const mailgun = require('mailgun-js');

@Processor(EMAIL_MESSAGEING_QUEUE)
export class EmailConsumer {
  @Process()
  async sendEmail(job: Job<SendEmailQueueJob>) {
    const { from, to, subject, html } = job.data;
    const MAILGUM_API_KEY = 'key-c8ad5d56358922fbadd34f5dad46f1bc';
    const MAILGUM_EMAIL_DOMAIN = 'mail1.odemru.xyz';
    const mg = mailgun({
      apiKey: MAILGUM_API_KEY,
      domain: MAILGUM_EMAIL_DOMAIN,
    });
    return await mg.messages().send({ from, to, subject, html });
  }
}
