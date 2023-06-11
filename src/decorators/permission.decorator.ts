import { SetMetadata } from '@nestjs/common';
import { PermissionAlias } from 'src/perm-role/perm-role.interface';

export const Permission = (...permissions: PermissionAlias[]) =>
  SetMetadata('permissions', permissions);
