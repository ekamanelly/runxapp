import { COUNTRIES } from './../constant/countries.constant';
import { Body, Controller, Query, UseGuards } from '@nestjs/common';
import {
  Get,
  Patch,
  Post,
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import { PaymentProcessorService } from 'src/payment-processor/payment-processor.service';
import { ServiceTypesService } from 'src/services-types/service-types.service';
import { SupportedBankQueryDto } from './dto/support-banks.query.dto';
import { RegisterUserDto } from 'src/users/dto/register-user.dto';
import { SystemService } from './system.service';
import { UpdateSystemDto } from './dto/update-system.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { RoleGuard } from 'src/guards/role.guard';
import { UserRoles } from 'src/users/interfaces/user.interface';
import { Roles } from 'src/decorators/roles.decorator';
@Controller('system')
export class SystemController {
  constructor(
    private readonly serviceTypesServices: ServiceTypesService,
    private readonly paymentProcessorService: PaymentProcessorService,
    private readonly systemService: SystemService,
  ) {}

  @Get('init')
  async initializeSystem() {
    const serviceTypes = await this.serviceTypesServices.getServiceTypes();
    const countries = COUNTRIES;
    return { serviceTypes, countries };
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.ADMIN)
  @Patch()
  async updateSystem(@Body() updateSystemDto: UpdateSystemDto) {
    return await this.systemService.updateSystem(updateSystemDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.ADMIN)
  @Get()
  async getSystem() {
    return await this.systemService.getSystem();
  }

  @Get('supported-banks')
  async getSupportedBanks(
    @Query() supportedBanksQueryDto: SupportedBankQueryDto,
  ) {
    const { country } = supportedBanksQueryDto;
    const supportedBanks = await this.paymentProcessorService.getSupportedBanks(
      country,
    );
    return supportedBanks.data.map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      currency: b.currency,
    }));
  }

  @Post('seed-user')
  async seedUsers(@Body() registerUserDto: RegisterUserDto) {
    return this.systemService.seedUser(registerUserDto);
  }
}
