import { Test, TestingModule } from '@nestjs/testing';
import { ServiceTypesController } from './service-types.controller';

describe('ServiceTypesController', () => {
  let controller: ServiceTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceTypesController],
    }).compile();

    controller = module.get<ServiceTypesController>(ServiceTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
