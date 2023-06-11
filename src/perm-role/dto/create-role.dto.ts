import { IsString, IsUUID, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class PermissionDto {
  @IsUUID()
  perm_id: string;

  @IsBoolean()
  active: boolean;
}

export class CreateRoleDto {
  @IsString()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  perms: PermissionDto[];
}
