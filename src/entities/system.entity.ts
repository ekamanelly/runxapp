import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class System {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  system_id: number;

  @Column({ type: 'boolean', nullable: true })
  allow_withrawal: boolean;

  @Column({ type: 'json', nullable: true })
  supported_banks: object;

  @Column({ type: 'float', nullable: true })
  sp_service_fee: number;

  @Column({ type: 'float', nullable: true })
  client_service_fee: number;

  @Column({ nullable: true, default: 0, type: 'float' })
  cancel_service_fee_percent: number;

  @Column({ nullable: true, default: 0, type: 'float' })
  cancel_service_fee_system_share_percent: number;

  @Column({ nullable: true, default: 0, type: 'float' })
  cancel_service_fee_sp_share_percent: number;
}
