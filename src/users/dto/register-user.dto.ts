import { Gender } from '../interfaces/user.interface';
import {
  IsString,
  IsEmail,
  IsEnum,
  Matches,
  MaxLength,
  MinLength,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
export class RegisterUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  @IsOptional()
  is_admin: boolean;

  @IsBoolean()
  @IsOptional()
  is_client: boolean = false;

  @IsBoolean()
  @IsOptional()
  is_sp: boolean = false;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsArray()
  @IsOptional()
  service_types?: string[];

  @IsNotEmpty({ message: 'User role is required' })
  get userRole(): string | undefined {
    if (this.is_admin) {
      return 'admin';
    }
    if (this.is_client) {
      return 'client';
    }
    if (this.is_sp) {
      return 'sp';
    }
    return undefined;
  }

  @IsNotEmpty({ message: 'Services offered is required for Service provider' })
  get getServicesOffered(): string | undefined {
    if (this.is_sp && (!this.service_types || !this.service_types.length)) {
      return undefined;
    }
    return 'sp';
  }

  @IsNotEmpty({
    message: 'Services offered is not required for client',
  })
  get checkClientForServicesOffered(): string | undefined {
    if (this.is_client && this.service_types) {
      return undefined;
    }
    return 'client';
  }

  @IsNotEmpty({
    message: 'Services offered is not required for admin',
  })
  get checkAdminForServicesOffered(): string | undefined {
    if (this.is_admin && this.service_types) {
      return undefined;
    }
    return 'admin';
  }
}
