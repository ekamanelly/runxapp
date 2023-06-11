import { Proposal } from 'src/entities/proposal.entity';
import { User } from 'src/entities/user.entity';
import {
  Entity,
  JoinTable,
  ManyToMany,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SharedEntity } from './shared.entity';
import { ServiceType } from './service-type.entity';

@Entity()
export class ServiceRequest extends SharedEntity {
  @ManyToMany(() => ServiceType)
  @JoinTable()
  service_types: ServiceType[];

  @OneToMany(() => Proposal, (srp) => srp.service_request)
  service_request_proposals: Proposal[];

  @ManyToOne(() => User, (user) => user.service_requests)
  created_by: User;

  @Column()
  description: string;

  @Column({ nullable: true })
  start_add: string;

  @Column({ nullable: true })
  start_state: string;

  @Column({ nullable: true })
  start_city: string;

  @Column({ nullable: true })
  end_add: string;

  @Column({ nullable: true })
  end_state: string;

  @Column({ nullable: true })
  end_city: string;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;
}
