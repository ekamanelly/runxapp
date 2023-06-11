import { Test, TestingModule } from '@nestjs/testing';
import { PermRoleService } from './perm-role.service';

describe('PermRoleService', () => {
  let service: PermRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermRoleService],
    }).compile();

    service = module.get<PermRoleService>(PermRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
