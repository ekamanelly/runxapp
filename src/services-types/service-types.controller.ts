import { Controller, Post, Get } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { ServiceTypesService } from './service-types.service';

@Controller('service-type')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  async createServiceOffered(
    @Body() createServiceTypeDto: CreateServiceTypeDto,
  ) {
    const res = await this.serviceTypesService.createServiceType(
      createServiceTypeDto,
    );
    return res;
  }

  @Get('list')
  async getServiceTypes() {
    return await this.serviceTypesService.getServiceTypes();
  }
}
