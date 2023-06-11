import { User } from 'src/entities/user.entity';

export interface StartProposalJob {
  serviceRequestId: string;
  proposalId: string;
}

export interface ClientInvoice {
  invoice_id: string;
  service_provider: Pick<User, 'first_name' | 'last_name' | 'id'>;
  status: InvoiceStatus;
  date_paid: Date;
  created_at: Date;
  paid_date: Date;
  service_address: string;
  proposal_id: string;
  sp_proposal_amount: number;
  sp_service_fee: number;
  client_service_fee: number;
}

export enum InvoiceStatus {
  'UNPAID' = 'UNPAID',
  'PAID' = 'PAID',
  'ESCROW' = 'ESCROW',
}

export enum ProposalStatus {
  // proposal sent
  'INVITED' = 'INVITED',
  // proposal that have been accepted
  'PENDING' = 'PENDING',
  // proposal that have started
  'IN_PROGRESS' = 'IN_PROGRESS',
  // client pays service provider and mark as completed
  'COMPLETED' = 'COMPLETED',
  // service provider complete job
  'AWAITING_PAYMENT' = 'AWAITING_PAYMENT',

  // client cacncelled invite
  'CANCELLED_INVITE' = 'CANCELLED_INVITE',
  // client cacncelled invite
  'CANCELLED' = 'CANCELLED',
  // invite declined by service provider
  'DECLINED' = 'DECLINED',
}

export interface ProposalCount {
  invited: number;
  pending: number;
  awaitingPayment: number;
  completed: number;
  inProgress: number;
  cancelled: number;
}
