import { UserRoles } from './../users/interfaces/user.interface';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AccessDeniedException } from 'src/exceptions';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }
    const currentUserRoles: UserRoles[] = [];
    if (user.is_sp) currentUserRoles.push(UserRoles.SERVICE_PROVIDER);
    if (user.is_client) currentUserRoles.push(UserRoles.CLIENT);
    if (user.is_admin) currentUserRoles.push(UserRoles.ADMIN);
    const isAllowed = roles.some((r) => currentUserRoles.includes(r as any));
    if (!isAllowed) {
      throw new AccessDeniedException();
    }
    return true;
  }
}
