import { Column, Entity } from 'typeorm';
import { SharedEntity } from './shared.entity';

@Entity()
export class ServiceType extends SharedEntity {
  @Column()
  name: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  parent_id: string;

  @Column({ default: 3000 })
  min_service_fee: number;

  @Column({ default: true })
  is_parent_only: boolean;
}
