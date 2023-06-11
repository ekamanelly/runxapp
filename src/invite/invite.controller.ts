import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InviteService } from './invite.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/entities/user.entity';
import { RoleGuard } from 'src/guards/role.guard';
import { SendInvitesDto } from 'src/invite/dto/send-invites.dto';
import { UserRoles } from 'src/users/interfaces/user.interface';
import { ApiResponse } from '@nestjs/swagger';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { DeclineInviteDto } from './dto/decline-invite.dto';
import { CancelInviteDto } from './dto/cancel-invite.dto';

@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post('/send-invites')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  async sendServiceRequestInvites(
    @CurrentUser() currentUser: User,
    @Body() sendServiceRequestInvitaionsDto: SendInvitesDto,
  ) {
    return await this.inviteService.sendInvites(
      currentUser,
      sendServiceRequestInvitaionsDto,
    );
  }

  @Post('/accept-invite')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  @ApiResponse({
    description: 'Only Service provider can accept invite',
  })
  async acceptInvite(
    @CurrentUser() currentUser: User,
    @Body() acceptInviteDto: AcceptInviteDto,
  ) {
    return await this.inviteService.acceptInvite(currentUser, acceptInviteDto);
  }

  @Post('/decline-invite')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  @ApiResponse({
    description:
      'Only Service provider can decline invite that proposal have not been sent to',
  })
  async declineInvite(
    @CurrentUser() currentUser: User,
    @Body() declineInviteDto: DeclineInviteDto,
  ) {
    return await this.inviteService.declineInvite(
      currentUser,
      declineInviteDto,
    );
  }

  @Post('/cancel-invite')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  @ApiResponse({
    description:
      'Only client can cancel invited that the service proposal have not sent invoice to',
  })
  async cancelInvite(
    @CurrentUser() currentUser: User,
    @Body() cancelInviteDto: CancelInviteDto,
  ) {
    return await this.inviteService.cancelInvite(currentUser, cancelInviteDto);
  }
}
