import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuditTrailController } from './admin-audit-trail.controller';
import { AdminAuditTrailService } from './admin-audit-trail.service';

describe('AdminAuditTrailController', () => {
  let controller: AdminAuditTrailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuditTrailController],
      providers: [AdminAuditTrailService],
    }).compile();

    controller = module.get<AdminAuditTrailController>(AdminAuditTrailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
