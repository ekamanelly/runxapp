import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { RaiseDisputeDto } from 'src/dispute/dto/raise-dispute.dto';
import { UserRoles } from 'src/users/interfaces/user.interface';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('dispute')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post('/raise-dispute')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER, UserRoles.CLIENT)
  @HttpCode(200)
  async raiseDispute(
    @CurrentUser() currentUser: User,
    @Body() raiseDisputeDto: RaiseDisputeDto,
  ) {
    return await this.disputeService.raiseDispute(currentUser, raiseDisputeDto);
  }

  @Post('/resolve-dispute')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.ADMIN)
  @HttpCode(200)
  async resolveDispute(@Body() resolveDisputeDto: ResolveDisputeDto) {
    return await this.disputeService.resolveDispute(resolveDisputeDto);
  }
}
