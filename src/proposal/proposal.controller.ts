import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/entities/user.entity';
import { RoleGuard } from 'src/guards/role.guard';
import { CompleteProposalDto } from 'src/proposal/dto/complete-proposal.dto';
import { UserRoles } from 'src/users/interfaces/user.interface';
import { AcceptProposalDto } from './dto/accept-proposal.dto';
import { SendProposalDto } from './dto/send-proposal.dto';
import { InitProposalDto } from './dto/init-proposal.dto';
import { PayServiceProviderDto } from './dto/pay-sp.dto';
import { ClientInvoice } from './proposal.interface';
import { PaginationResponse } from 'src/common/interface';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Proposal } from 'src/entities/proposal.entity';
import { ServiceProviderCancelProposalDto } from './dto/sp-cancel-proposal.dto';
import { ClientCancelProposalDto } from './dto/client-cancel-proposal.dto';

@Controller('proposal')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post('/init')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  @HttpCode(200)
  async initProposal(
    @Body() initProposalDto: InitProposalDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.proposalService.initProposal(
      currentUser,
      initProposalDto,
    );
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async sendProposal(
    @CurrentUser() currentUser: User,
    @Body() sendProposalDto: SendProposalDto,
  ) {
    return await this.proposalService.sendProposal(
      currentUser,

      sendProposalDto,
    );
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  @HttpCode(200)
  async acceptProposal(
    @CurrentUser() currentUser: User,
    @Body() acceptProposalDto: AcceptProposalDto,
  ) {
    return await this.proposalService.acceptProposal(
      currentUser,
      acceptProposalDto,
    );
  }

  @Post('client-cancel')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  @HttpCode(200)
  async cancelProposal(
    @CurrentUser() currentUser: User,
    @Body() clientCancelProposalDto: ClientCancelProposalDto,
  ) {
    return await this.proposalService.clientCancelProposal(
      currentUser,
      clientCancelProposalDto,
    );
  }

  @Post('sp-cancel')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  @HttpCode(200)
  async serviceProviderCancelProposal(
    @CurrentUser() currentUser: User,
    @Body() spCancelProposalDto: ServiceProviderCancelProposalDto,
  ) {
    return await this.proposalService.serviceProviderCancelProposal(
      currentUser,
      spCancelProposalDto,
    );
  }

  @Post('complete')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  @HttpCode(200)
  async completeProposal(
    @CurrentUser() currentUser: User,
    @Body() completeProposalDto: CompleteProposalDto,
  ) {
    return await this.proposalService.completeProposal(
      currentUser,
      completeProposalDto,
    );
  }

  @Post('pay-sp')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  @HttpCode(200)
  async payServiceProvider(
    @CurrentUser() currentUser: User,
    @Body() payServiceProviderDto: PayServiceProviderDto,
  ) {
    return await this.proposalService.payServiceProvider(
      currentUser,
      payServiceProviderDto,
    );
  }

  @Post('id/:proposalId/start')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(200)
  async startProposal(@Param('proposalId') proposalId: string) {
    return await this.proposalService.startProposal(proposalId);
  }

  @Get('client-invoices')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  @HttpCode(200)
  async clientProposalInvoices(
    @Query() paginationQueryDto: PaginationQueryDto,
    @CurrentUser() currentUser: User,
  ): Promise<PaginationResponse<ClientInvoice>> {
    return await this.proposalService.clientProposalInvoices(
      currentUser,
      paginationQueryDto,
    );
  }

  @Get('/id/:proposalId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HttpCode(200)
  async getProposalById(
    @Param('proposalId') proposalId: string,
  ): Promise<Proposal> {
    return await this.proposalService.getProposalById(proposalId);
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  @HttpCode(200)
  async withdrawProposal(
    @CurrentUser() currentUser: User,
    @Body() completeProposalDto: CompleteProposalDto,
  ) {
    return await this.proposalService.completeProposal(
      currentUser,
      completeProposalDto,
    );
  }
}
