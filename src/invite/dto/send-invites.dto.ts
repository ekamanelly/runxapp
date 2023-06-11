import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateServiceRequestDto } from '../../service-request/dto/create-service-request.dto';

export class SendInvitesDto {
  @IsArray()
  service_providers: string[];

  @IsUUID()
  @IsOptional()
  service_request_id: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsArray()
  @IsOptional()
  service_types: string[];

  @IsString()
  @IsOptional()
  start_add: string;

  @IsString()
  @IsOptional()
  start_state: string;

  @IsString()
  @IsOptional()
  start_city: string;

  @IsString()
  @IsOptional()
  end_add: string;

  @IsString()
  @IsOptional()
  end_state: string;

  @IsString()
  @IsOptional()
  end_city: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  start_date: Date;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  end_date: Date;

  @IsNotEmpty({ message: 'Service request is required' })
  checkRequestId() {
    if (!this.service_request_id && !this.service_types.length) {
      return null;
    }
    return 'okay';
  }
}
