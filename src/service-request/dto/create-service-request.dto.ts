import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateServiceRequestDto {
  @IsString()
  description: string;

  @IsArray()
  service_types: string[];

  @IsString()
  start_add: string;

  @IsString()
  start_state: string;

  @IsString()
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
  start_date: Date;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  end_date: Date;
}
