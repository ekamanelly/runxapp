import { CreateRoleDto } from './dto/create-role.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { Role } from 'src/entities/role.entity';
import { CatchErrorException } from 'src/exceptions';
import { In, Repository } from 'typeorm';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from 'src/entities/permission.entity';
import { PERMISSIONS } from './perm-role.constant';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import { RolePermission } from 'src/entities/role-permission.entity';

@Injectable()
export class PermRoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
  ) {}

  async findRoleById(roleId: string) {
    try {
      return await this.roleRepo.findOne({
        where: { id: roleId },
        relations: { permissions: true },
      });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async createRole(currentAdmin: Admin, createRoleDto: CreateRoleDto) {
    try {
      const { name, perms } = createRoleDto;
      const validatedPerms = await this.findPermsByIds(
        perms.map((p) => p.perm_id),
      );
      const newRole = await this.roleRepo.create({ name });
      const role = await this.roleRepo.save(newRole);
      const newRolePerms: RolePermission[] = [];
      for (const perm of validatedPerms) {
        const { active, id } = perm;
        newRolePerms.push({
          perm_id: id,
          role_id: role.id,
          permission: perm,
          active,
          role,
        });
      }
      const manyRolePerms = await this.rolePermRepo.create(newRolePerms);
      const rolePerms = await this.rolePermRepo.save(manyRolePerms);
      role.permissions = rolePerms;
      return await this.roleRepo.save(role);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async findRoles() {
    try {
      return await this.roleRepo.find({ relations: { permissions: true } });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async updateRole(currentAdmin: Admin, updateRoleDto: UpdateRoleDto) {
    try {
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async createPermissions() {
    try {
      const perms = await this.permRepo.create(PERMISSIONS);
      await this.permRepo.save(perms);
      return new ResponseMessage('permission successfully created');
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async findPermissions() {
    try {
      return await this.permRepo.find();
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async findPerm(permId: string) {
    try {
      return await this.permRepo.findOne({ where: { id: permId } });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async findPermsByIds(ids: string[]) {
    try {
      const perms = await this.permRepo.find({
        where: { id: In(ids) },
      });
      if (perms.length !== ids.length) {
        throw new HttpException(
          'Permission contains invalid permission id',
          HttpStatus.NOT_FOUND,
        );
      }
      return perms;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
