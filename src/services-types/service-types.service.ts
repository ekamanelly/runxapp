import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceType } from 'src/entities/service-type.entity';
import { In, Repository } from 'typeorm';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { CatchErrorException } from 'src/exceptions';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectRepository(ServiceType)
    private serviceTypeRepository: Repository<ServiceType>,
  ) {}

  async createServiceType(serviceTypeDto: CreateServiceTypeDto) {
    const serviceType = await this.getServiceTypeByName(serviceTypeDto.name);
    if (serviceType) {
      throw new HttpException(
        'Service type already exist',
        HttpStatus.CONFLICT,
      );
    }
    const res = await this.serviceTypeRepository.save(serviceTypeDto);
    return res;
  }

  async getServiceTypes() {
    return await this.serviceTypeRepository.createQueryBuilder('st').getMany();
  }

  async getServiceTypesByIds(ids: string[]) {
    try {
      const serviceTypes = await this.serviceTypeRepository.find({
        where: { id: In(ids) },
      });
      if (serviceTypes.length !== serviceTypes.length) {
        throw new HttpException(
          'Service types contain invalid service types',
          HttpStatus.NOT_FOUND,
        );
      }
      return serviceTypes;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getServiceTypeById(id: string) {
    return await this.serviceTypeRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getServiceTypeByName(name: string) {
    return await this.serviceTypeRepository.findOne({
      where: {
        name,
      },
    });
  }
}
