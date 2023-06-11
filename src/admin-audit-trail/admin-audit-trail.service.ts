import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminAuditTrail } from 'src/entities/admin-audit-trail.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminAuditTrailService {
  constructor(
    @InjectRepository(AdminAuditTrail)
    private readonly adminAuditTrailRepo: Repository<AdminAuditTrail>,
  ) {}

  async createlog() {
    const log = await this.adminAuditTrailRepo.create({});
    return await this.adminAuditTrailRepo.save(log);
  }
}
