import { SharedEntity } from './shared.entity';
import { Admin } from './admin.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Proposal } from './proposal.entity';
import { AdminAuditTrailType } from 'src/admin-audit-trail/admin-audit-trail.interface';

@Entity()
export class AdminAuditTrail extends SharedEntity {
  @ManyToMany(() => Admin, (admin) => admin.audit_trails)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  @Column({ type: 'enum', enum: AdminAuditTrailType })
  type: AdminAuditTrailType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'affected_user_id' })
  affected_user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'affected_proposal_id' })
  affected_proposal: Proposal;

  @Column({ nullable: true })
  reason: string;
}
