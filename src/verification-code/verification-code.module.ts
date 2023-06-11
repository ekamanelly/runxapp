import { VerificationCode } from 'src/entities/verification-code.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { VerificationCodeService } from './verification-code.service';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationCode])],
  exports: [VerificationCodeService],
})
export class VerificationCodeModule {}
