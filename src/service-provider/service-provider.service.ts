import { UsersService } from 'src/users/users.service';
import { ServiceTypesService } from 'src/services-types/service-types.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { User } from 'src/entities/user.entity';
import { CatchErrorException } from 'src/exceptions';
import { SPJobQueryDto } from 'src/service-request/dto/sp-job.query.dto';
import { Repository } from 'typeorm';
import { SearchServiceProviderQueryDto } from 'src/service-provider/dto/search-service-provider-query.dto';
import { ProposalService } from 'src/proposal/proposal.service';
import { ProposalCount } from 'src/proposal/proposal.interface';

@Injectable()
export class ServiceProviderService {
  constructor(
    private readonly serviceTypeService: ServiceTypesService,
    private readonly userService: UsersService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly proposalService: ProposalService,
  ) {}

  async getServiceProviderJobs(
    user: User,
    query: SPJobQueryDto,
  ): Promise<Pagination<any>> {
    try {
      return await this.proposalService.getServiceProviderJobs(user, query);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getServiceProviderJobCount(user: User): Promise<ProposalCount> {
    try {
      return await this.proposalService.getServiceProviderJobCount(user);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async jobOverview(currentUser: User) {
    try {
      return await this.proposalService.serviceProviderJobOverview(currentUser);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async searchServiceProvider(
    query: SearchServiceProviderQueryDto,
  ): Promise<Pagination<Partial<User>>> {
    try {
      const {
        state,
        city,
        price_from,
        price_to,
        rating,
        gender,
        profile_pic,
        page,
        limit,
        service_types,
      } = query;
      const qb = this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.service_types', 'st')
        .where('user.is_verified = :isVerified', { isVerified: true })
        .andWhere('user.is_sp = :isSp', { isSp: true })
        .andWhere('user.is_avai = :isAvai', { isAvai: true })
        .andWhere('user.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('user.is_deactivated = :isDeactivated', {
          isDeactivated: false,
        })
        .select([
          'user.id',
          'user.last_name',
          'user.first_name',
          'user.sp_average_rating',
          'st.name',
          'user.email',
          'user.is_avai',
          'user.is_online',
          'user.loc_state',
          'user.loc_city',
          'user.gender',
          'user.amount_per_hour',
          'user.photo_uri',
          'st.id',
        ]);

      if (state) {
        qb.andWhere('user.loc_state = :state', { state: state });
      }
      if (service_types) {
        const _splittedTypes = service_types.split(',');
        if (!_splittedTypes.some((t) => t === '')) {
          await this.serviceTypeService.getServiceTypesByIds(_splittedTypes);
          qb.andWhere('st.id IN (:...serviceTypeIds)', {
            serviceTypeIds: _splittedTypes,
          });
        }
      }
      if (city) {
        qb.andWhere('user.loc_city = :city', { city: city });
      }
      if (price_from) {
        qb.andWhere('user.amount_per_hour >= :price_from', {
          price_from: price_from,
        });
      }
      if (price_to) {
        qb.andWhere('user.amount_per_hour <= :price_to', {
          price_to: price_to,
        });
      }
      if (gender) {
        qb.andWhere('user.gender = :gender', { gender: gender });
      }
      if (rating) {
        qb.andWhere('user.sp_average_rating >= :rating', { rating: rating });
      }
      if (profile_pic) {
        qb.andWhere('user.photo_uri IS NOT NULL');
      }
      return await paginate<Partial<User>>(qb, { page, limit });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getPublicServiceProvider(serviceProviderId: string): Promise<User> {
    try {
      return await this.userService.getUserById(serviceProviderId);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
