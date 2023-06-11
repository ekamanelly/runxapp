import { Column, Entity, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { SharedEntity } from './shared.entity';
import { PermissionAlias } from 'src/perm-role/perm-role.interface';
import { Admin } from './admin.entity';

@Entity()
export class Permission extends SharedEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: PermissionAlias })
  alias: PermissionAlias;

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @OneToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @OneToMany(() => Admin, (admin) => admin.permissions)
  admins: Admin[];
}
