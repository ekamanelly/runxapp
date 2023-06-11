import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { AuthService } from 'src/auth/auth.service';
import { ToggleTwoFADto } from './dto/toggle-2fa.dto';
import { CurrentAdmin } from 'src/decorators/current-admin.decorator';
import { Admin } from 'src/entities/admin.entity';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post('/invite')
  async inviteAdmin(
    @CurrentAdmin() currentAdmin: Admin,
    @Body() inviteAdminDto: InviteAdminDto,
  ) {
    return await this.adminService.invite(currentAdmin, inviteAdminDto);
  }

  @Post('/accept-invite')
  async accpetInviteAdmin(
    @CurrentAdmin() currentAdmin: Admin,
    @Body() inviteAdminDto: InviteAdminDto,
  ) {
    return await this.adminService.invite(currentAdmin, inviteAdminDto);
  }
  @Get('/profile/:profileId')
  async adminProfile(@Param('profileId') profileId: string) {
    return await this.adminService.getAdminById(profileId);
  }

  @Post('/2fa/toggle')
  // @UseGuards(JwtAuthGuard)
  async toggleTwoFactorAuthentication(
    @CurrentAdmin() admin: Admin,
    @Body() toggleTwoFADto: ToggleTwoFADto,
  ) {
    const { two_fa_code, enable_two_fa } = toggleTwoFADto;
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      two_fa_code,
      admin,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.adminService.toggleTwoFactorAuthentication(
      admin.id,
      enable_two_fa,
    );
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(@CurrentAdmin() admin: Admin, @Body() body) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      admin,
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.authService.loginAdminWith2fa(admin);
  }
}
