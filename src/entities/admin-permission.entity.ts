import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Permission } from './permission.entity';
import { Admin } from './admin.entity';

@Entity()
export class AdminPermission {
  @PrimaryColumn()
  perm_id: string;

  @PrimaryColumn()
  admin_id: string;

  @ManyToOne(() => Permission, (permission) => permission.admins)
  permission: Permission;

  @ManyToOne(() => Admin, (admin) => admin.permissions)
  admin: Admin;

  @Column({ default: false })
  active: boolean;
}
