export interface SendEmailQueueJob {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Array<any>;
}
