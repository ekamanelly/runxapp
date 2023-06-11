import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuditTrailService } from './admin-audit-trail.service';

describe('AdminAuditTrailService', () => {
  let service: AdminAuditTrailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminAuditTrailService],
    }).compile();

    service = module.get<AdminAuditTrailService>(AdminAuditTrailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
