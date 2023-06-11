import { Test, TestingModule } from '@nestjs/testing';
import { PermRoleController } from './perm-role.controller';
import { PermRoleService } from './perm-role.service';

describe('PermRoleController', () => {
  let controller: PermRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermRoleController],
      providers: [PermRoleService],
    }).compile();

    controller = module.get<PermRoleController>(PermRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
