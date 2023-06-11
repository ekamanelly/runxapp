import { SharedEntity } from './shared.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { Admin } from './admin.entity';
import { RolePermission } from './role-permission.entity';

@Entity()
export class Role extends SharedEntity {
  @Column()
  name: string;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  @JoinColumn({ name: 'perm_id' })
  permissions: RolePermission[];

  @OneToMany(() => Admin, (a) => a.role, { cascade: true, nullable: true })
  admins: Admin[];
}
