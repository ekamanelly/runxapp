import {
  IdentifierType,
  VerificationCodeType,
} from './../verification-code/interfaces/verification-code.interface';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: ' verification_code' })
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column({
    enum: VerificationCodeType,
    default: VerificationCodeType.VERIFY_EMAIL,
    nullable: true,
  })
  type: VerificationCodeType;

  @Column()
  identifier: string;

  @Column({ enum: IdentifierType, default: IdentifierType.EMAIL })
  iden_type: IdentifierType;

  @Column({ default: false })
  is_used: boolean;

  @Column({ type: 'timestamp' })
  expiry_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  used_at: Date;

  @Column()
  user_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
