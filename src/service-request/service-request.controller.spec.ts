import { Test, TestingModule } from '@nestjs/testing';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequestService } from './service-request.service';

describe('ServiceRequestController', () => {
  let controller: ServiceRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceRequestController],
      providers: [ServiceRequestService],
    }).compile();

    controller = module.get<ServiceRequestController>(ServiceRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
