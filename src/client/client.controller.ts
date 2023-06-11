import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/entities/user.entity';
import { RoleGuard } from 'src/guards/role.guard';
import { ClientServiceRequestQueryDto } from 'src/service-request/dto/client-service-request.dto';
import { UserRoles } from 'src/users/interfaces/user.interface';
import { Proposal } from 'src/entities/proposal.entity';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('job-count')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  async getServiceRequestStats(
    @CurrentUser() user: User,
    @Query() query: ClientServiceRequestQueryDto,
  ) {
    return await this.clientService.getClientJobCount(user);
  }

  @Get('/jobs')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  async getClientJobs(
    @CurrentUser() user: User,
    @Query() query: ClientServiceRequestQueryDto,
  ): Promise<Pagination<Proposal>> {
    return await this.clientService.getClientJobs(user, query);
  }
}
