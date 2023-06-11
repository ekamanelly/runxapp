import { Controller } from '@nestjs/common';
import { AdminAuditTrailService } from './admin-audit-trail.service';

@Controller('admin-audit-trail')
export class AdminAuditTrailController {
  constructor(private readonly adminAuditTrailService: AdminAuditTrailService) {}
}
