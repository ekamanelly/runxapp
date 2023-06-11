import { UsersService } from './../users/users.service';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Hash } from 'src/common/utils/hash.util';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { jwtConstants } from './auth.constant';
import { Admin } from 'src/entities/admin.entity';
import { AdminService } from 'src/admin/admin.service';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (user) {
      const isMatch = await Hash.compare(password, user.password);
      if (isMatch) {
        const { password, trnx_pin, ...rest } = user;
        return rest;
      } else {
        return null;
      }
    }
  }

  async login(user: User) {
    const payload = { username: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
      }),
    };
  }

  async validateAdmin(email: string, password: string) {
    const admin = await this.adminService.findAdminByEmail(email);
    if (admin) {
      const isMatch = await Hash.compare(password, admin.password);
      if (isMatch) {
        const { password, ...rest } = admin;
        return rest;
      } else {
        return null;
      }
    }
  }

  async loginAdmin(admin: Admin) {
    const payload = { username: admin.email, sub: admin.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
      }),
    };
  }

  async generateAdminTwoFaSecret(admin: Admin) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(admin.email, 'Runx', secret);
    await this.adminService.setTwoFactorAuthenticationSecret(secret, admin.id);

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    admin: Admin,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: admin.two_fa_secret,
    });
  }

  async loginAdminWith2fa(admin: Partial<Admin>) {
    const payload = {
      email: admin.email,
      is_two_fa_enabled: !!admin.is_two_fa_enabled,
      is_two_fa_authenticated: true,
    };

    return {
      email: payload.email,
      access_token: this.jwtService.sign(payload),
    };
  }
}
