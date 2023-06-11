import { Module } from '@nestjs/common';
import { PermRoleService } from './perm-role.service';
import { PermRoleController } from './perm-role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { Permission } from 'src/entities/permission.entity';
import { RolePermission } from 'src/entities/role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  controllers: [PermRoleController],
  providers: [PermRoleService],
  exports: [PermRoleService],
})
export class PermRoleModule {}
