import { ServiceRequest } from '../entities/service-request.entity';
import { ServiceTypesService } from 'src/services-types/service-types.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { User } from 'src/entities/user.entity';
import { CatchErrorException } from 'src/exceptions';
import { GET_SERVICE_REQUEST_BY_ID_FIELDS } from './service-request.constant';
import { PatchServiceRequestDto } from './dto/patch-service-request.dto';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestRepo: Repository<ServiceRequest>,
    private serviceTypesService: ServiceTypesService,
  ) {}

  async create(createServiceRequestDto: CreateServiceRequestDto, user: User) {
    try {
      const { service_types } = createServiceRequestDto;
      const serviceTypes = await this.serviceTypesService.getServiceTypesByIds(
        service_types,
      );
      if (!serviceTypes.length) {
        throw new HttpException('Invalid service type', HttpStatus.BAD_REQUEST);
      }
      const request = await this.serviceRequestRepo.save({
        ...createServiceRequestDto,
        service_types: serviceTypes,
        created_by: user,
      });
      return await this.getServiceRequestById(request.id);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async patchServiceRequest(
    id: string,
    patchServiceRequestDto: PatchServiceRequestDto,
  ) {
    try {
      const request = await this.getServiceRequestById(id);
      const { service_types, ...__patchServiceRequestDto } =
        patchServiceRequestDto;
      if (service_types.length) {
        const serviceTypes =
          await this.serviceTypesService.getServiceTypesByIds(service_types);
        request.service_types = serviceTypes;
      }
      await this.serviceRequestRepo.save({
        ...request,
        ...__patchServiceRequestDto,
      });
      return await this.getServiceRequestById(request.id);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getServiceRequestById(id: string, isThrowError = true) {
    try {
      const serviceRequest = await this.serviceRequestRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.created_by', 'user')
        .leftJoinAndSelect('r.service_types', 'st')
        .where('r.id = :id', { id })
        .select(GET_SERVICE_REQUEST_BY_ID_FIELDS)
        .getOne();
      if (!serviceRequest && isThrowError) {
        throw new NotFoundException('Service Request not found');
      }
      return serviceRequest;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
