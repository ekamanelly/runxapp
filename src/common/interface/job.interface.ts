import { ProposalStatus } from 'src/proposal/proposal.interface';

export interface ServiceProviderJob {
  description: string;
  start_date: Date;
  start_add: string;
  amount: number;
  id: string;
  service_request_id: string;
  service_fee: number;
  service_types: { name: string; id: string }[];
  created_by: {
    first_name: string;
    last_name: string;
    id: string;
  };
  status: ProposalStatus;
  created_at: Date;
  end_date: Date;
  end_add: string;
}
