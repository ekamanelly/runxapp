import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { User } from 'src/entities/user.entity';
import { UserRoles } from '../users/interfaces/user.interface';
import { RoleGuard } from '../guards/role.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ServiceRequestService } from './service-request.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { SearchServiceProviderQueryDto } from '../service-provider/dto/search-service-provider-query.dto';
import { ClientServiceRequestQueryDto } from './dto/client-service-request.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ServiceRequest } from 'src/entities/service-request.entity';
import { PatchServiceRequestDto } from './dto/patch-service-request.dto';

@Controller('service-requests')
export class ServiceRequestController {
  constructor(private readonly serviceRequestsService: ServiceRequestService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  async create(
    @CurrentUser() user: User,
    @Body() createServiceRequestDto: CreateServiceRequestDto,
  ) {
    const res = await this.serviceRequestsService.create(
      createServiceRequestDto,
      user,
    );
    return res;
  }

  @Get('id/:serviceRequestId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT, UserRoles.ADMIN, UserRoles.SERVICE_PROVIDER)
  async getServiceRequestById(
    @Param('serviceRequestId') serviceRequestId: string,
  ) {
    return await this.serviceRequestsService.getServiceRequestById(
      serviceRequestId,
    );
  }

  @Patch('id/:serviceRequestId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT, UserRoles.ADMIN, UserRoles.SERVICE_PROVIDER)
  async patchServiceRequest(
    @Param('serviceRequestId') serviceRequestId: string,
    @Body() patchServiceRequestDto: PatchServiceRequestDto,
  ) {
    return await this.serviceRequestsService.patchServiceRequest(
      serviceRequestId,
      patchServiceRequestDto,
    );
  }
}
