import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity()
export class RolePermission {
  @PrimaryColumn()
  perm_id: string;

  @PrimaryColumn()
  role_id: string;

  @ManyToOne(() => Permission, (permission) => permission.roles)
  permission: Permission;

  @ManyToOne(() => Role, (role) => role.permissions)
  role: Role;

  @Column({ default: false })
  active: boolean;
}
