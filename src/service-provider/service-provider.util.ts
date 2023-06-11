import { ServiceProviderJob } from 'src/common/interface/job.interface';
import { Proposal } from 'src/entities/proposal.entity';

export const stripJob = (p: Proposal): ServiceProviderJob => {
  const sr = p.service_request;
  const created_by = sr.created_by;
  return {
    description: sr.description,
    start_date: sr.start_date,
    start_add: sr.start_add,
    end_date: sr.end_date,
    end_add: sr.end_add,
    amount: p.sp_proposal_amount || 0,
    service_fee: p.sp_service_fee,
    id: p.id,
    service_request_id: sr.id,
    created_at: p.created_at,
    service_types: sr?.service_types
      ? sr?.service_types.map((st) => ({
          id: st.id,
          name: st.name,
        }))
      : [],
    created_by: {
      first_name: created_by?.first_name,
      last_name: created_by?.last_name,
      id: created_by.id,
    },
    status: p.status,
  };
};
