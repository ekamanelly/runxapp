import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class SharedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  updated_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  deleted_at?: Date;

  @Column({ nullable: true })
  updated_by?: string;

  @Column({ nullable: true })
  deleted_by?: string;

  @Column({ nullable: true })
  is_deleted: boolean;
}
