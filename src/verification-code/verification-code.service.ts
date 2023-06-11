import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationCode } from 'src/entities/verification-code.entity';
import { MoreThan, Repository } from 'typeorm';
import {
  GenerateCode,
  VerifyCode,
} from './interfaces/verification-code.interface';

@Injectable()
export class VerificationCodeService {
  constructor(
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
  ) {}

  generateVerificationCode(length: number): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  async generateCode({ userId, type, iden_type, identifier }: GenerateCode) {
    //check existing otp
    const existingCodes = await this.verificationCodeRepository.find({
      where: {
        type,
        user_id: userId,
        is_used: false,
        iden_type,
        identifier,
      },
    });
    // invalidate existing otp
    if (existingCodes.length) {
      existingCodes.forEach(async (c) => {
        await this.markAsUsed(c.id);
      });
    }

    const code = this.generateVerificationCode(4);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const literals = {
      code,
      type,
      expiry_at: expiry,
      user_id: userId,
      iden_type,
      identifier,
    };
    const res = await this.verificationCodeRepository.save(literals as any);
    return res.code;
  }

  async verifyCode({ userId, code, type, iden_type, identifier }: VerifyCode) {
    const verCode = await this.verificationCodeRepository.findOne({
      where: {
        type,
        code,
        user_id: userId,
        expiry_at: MoreThan(new Date()),
        is_used: false,
        iden_type,
        identifier,
      },
    });
    return verCode;
  }

  async markAsUsed(id: string) {
    await this.verificationCodeRepository.update(id, {
      is_used: true,
      used_at: new Date(),
    });
    return;
  }
}
