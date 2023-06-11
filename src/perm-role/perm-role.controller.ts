import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PermRoleService } from './perm-role.service';
import { Role } from 'src/entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CurrentAdmin } from 'src/decorators/current-admin.decorator';
import { Admin } from 'src/entities/admin.entity';

@Controller('perm-role')
export class PermRoleController {
  constructor(private readonly permRoleService: PermRoleService) {}

  @Post('/role/create')
  @HttpCode(201)
  async createRole(
    @CurrentAdmin() currentAdmin: Admin,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return await this.permRoleService.createRole(currentAdmin, createRoleDto);
  }

  @Get('/role/id/:roleId')
  @HttpCode(200)
  async getRole(@Param('roleId') roleId: string) {
    return await this.permRoleService.findRoleById(roleId);
  }

  @Get('/role/list')
  @HttpCode(200)
  async getRoles(): Promise<Role[]> {
    return await this.permRoleService.findRoles();
  }

  @Patch('/role/id/:roleId')
  @HttpCode(200)
  async updateRole(
    @CurrentAdmin() currentAdmin: Admin,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.permRoleService.updateRole(currentAdmin, updateRoleDto);
  }

  @Post('perm/create')
  @HttpCode(201)
  async createPermissions() {
    return this.permRoleService.createPermissions();
  }

  @Get('perm/list')
  @HttpCode(200)
  async getPermissions() {
    return this.permRoleService.findPermissions();
  }
}
