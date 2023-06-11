import { Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';

export type PaginationResponse<T> = Promise<
  Pagination<Partial<T>, IPaginationMeta>
>;

export enum OrderBy {
  'DESC' = 'DESC',
  'ASC' = 'ASC',
}

export enum ActionCreator {
  'SERVICE_PROVIDER' = 'SERVICE_PROVIDER',
  'CLIENT' = 'CLIENT',
}
