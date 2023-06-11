import { ServiceProviderJob } from 'src/common/interface/job.interface';
import { User } from 'src/entities/user.entity';

export interface SpJobOverviewResponse {
  todaySchedule: { count: number; data: ServiceProviderJob[] };
  inProgress: { count: number; data: ServiceProviderJob[] };
  invited: { count: number; data: ServiceProviderJob[] };
  pending: { count: number; data: ServiceProviderJob[] };
}

export type ServiceProdiverPublicProfile = Pick<
  User,
  'first_name' | 'last_name' | 'sp_average_rating'
>;
