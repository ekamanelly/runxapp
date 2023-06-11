import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseUser } from './base-user.entity';
import { AdminAuditTrail } from './admin-audit-trail.entity';
import { Role } from './role.entity';
import { AdminPermission } from './admin-permission.entity';

@Entity()
export class Admin extends BaseUser {
  @Column()
  designation: string;

  @OneToMany(() => AdminAuditTrail, (audit) => audit.created_at)
  audit_trails: AdminAuditTrail[];

  @ManyToOne(() => Role, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  two_fa_secret: string;

  @Column({ nullable: true })
  is_two_fa_enabled: boolean;

  @OneToMany(() => AdminPermission, (adminPerm) => adminPerm.admin)
  permissions: AdminPermission[];
}
