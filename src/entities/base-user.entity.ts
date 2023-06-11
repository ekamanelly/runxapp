import { Gender } from 'src/users/interfaces/user.interface';
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class BaseUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  deleted_at?: Date;

  @Column({ nullable: true })
  delete_reason?: string;

  @Column({ nullable: true, default: false })
  is_deleted: boolean;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'bigint', unique: true, nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  unique_id: string;

  @Column({ nullable: true })
  loc_add: string;

  @Column({ nullable: true, default: false })
  is_online: boolean;

  @Column({ nullable: true })
  birth_date: Date;

  @Column({ nullable: true })
  loc_state: string;

  @Column({ nullable: true, type: 'timestamp' })
  deactivated_at?: Date;

  @Column({ nullable: true, default: false })
  is_deactivated: boolean;

  @Column({ nullable: true })
  photo_uri: string;

  @Column({ nullable: true })
  loc_city: string;

  @Column({ nullable: true })
  loc_country: string;
}
