import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { ServiceRequest } from 'src/entities/service-request.entity';
import { User } from 'src/entities/user.entity';
import { RoleGuard } from 'src/guards/role.guard';
import { SPJobQueryDto } from 'src/service-request/dto/sp-job.query.dto';
import { UserRoles } from 'src/users/interfaces/user.interface';
import { ApiResponse } from '@nestjs/swagger';
import { SearchServiceProviderQueryDto } from 'src/service-provider/dto/search-service-provider-query.dto';

@Controller('sp')
export class ServiceProviderController {
  constructor(private readonly spService: ServiceProviderService) {}

  @Get('job/list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async getServiceProviderJobs(
    @CurrentUser() user: User,
    @Query() query: SPJobQueryDto,
  ): Promise<Pagination<ServiceRequest>> {
    return await this.spService.getServiceProviderJobs(user, query);
  }

  @Get('job/count')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async getServiceProviderJobCount(@CurrentUser() user: User) {
    return await this.spService.getServiceProviderJobCount(user);
  }

  @Get('job/overview')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async jobOverview(@CurrentUser() currentUser: User) {
    return await this.spService.jobOverview(currentUser);
  }

  @Get('/search')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  async getServiceRequestServiceProviders(
    @CurrentUser() user: User,
    @Query() query: SearchServiceProviderQueryDto,
  ) {
    return await this.spService.searchServiceProvider(query);
  }

  @Get('/public/:serviceProviderId')
  @UseGuards(JwtAuthGuard)
  async getPublicServiceProvider(
    @Param('serviceProviderId') serviceProviderId: string,
  ): Promise<User> {
    return await this.spService.getPublicServiceProvider(serviceProviderId);
  }
}
