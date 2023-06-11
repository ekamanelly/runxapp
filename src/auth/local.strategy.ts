import { UsersService } from './../users/users.service';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ERROR_MESSAGES } from 'src/constant/error.message.constant';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.is_deactivated) {
      throw new UnauthorizedException(
        'Account have been deactivated contact support',
      );
    }
    if (!user.is_verified) {
      await this.usersService.requestEmailVerification(user.email);
      throw new UnauthorizedException(ERROR_MESSAGES.emailNotVerified);
    }
    return user;
  }
}
