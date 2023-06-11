import { Module } from '@nestjs/common';
import { AdminAuditTrailService } from './admin-audit-trail.service';
import { AdminAuditTrailController } from './admin-audit-trail.controller';
import { AdminAuditTrail } from 'src/entities/admin-audit-trail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AdminAuditTrail])],
  controllers: [AdminAuditTrailController],
  providers: [AdminAuditTrailService],
})
export class AdminAuditTrailModule {}
