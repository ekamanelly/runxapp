import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly adminService: AdminService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    });
  }

  async validate(payload: any) {
    const admin = await this.adminService.findAdminByEmail(payload.email);
    if (!admin.is_two_fa_enabled) {
      return admin;
    }
    if (payload.is_two_fa_authenticated) {
      return admin;
    }
  }
}
