import { Type } from 'class-transformer';
import { IsBoolean, IsString, IsUUID, ValidateNested } from 'class-validator';

export class InviteAdminDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  email: string;

  @IsString()
  designation: string;

  @IsUUID()
  role_id: string;

  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  perms: PermissionDto[] = [];
}

class PermissionDto {
  @IsUUID()
  perm_id: string;

  @IsBoolean()
  active: boolean;
}
