import { InviteAdminDto } from './dto/invite-admin.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { CatchErrorException } from 'src/exceptions';
import { PermRoleService } from 'src/perm-role/perm-role.service';
import { EntityManager, Repository } from 'typeorm';
import { AdminAcceptInviteDto } from './dto/admin-accept-invite.dto';
import { AdminPermission } from 'src/entities/admin-permission.entity';
import { Hash } from 'src/common/utils/hash.util';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(AdminPermission)
    private readonly adminPermRepo: Repository<AdminPermission>,
    private readonly permRoleService: PermRoleService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async invite(currentAdmin: Admin, inviteAdminDto: InviteAdminDto) {
    try {
      const { first_name, last_name, email, role_id, perms, designation } =
        inviteAdminDto;
      const [foundAdmin, foundRole] = await Promise.all([
        this.adminRepo.findOne({ where: { email } }),
        this.permRoleService.findRoleById(role_id),
      ]);
      if (foundAdmin) {
        throw new HttpException('Admin already exists', HttpStatus.BAD_REQUEST);
      }
      if (!foundRole) {
        throw new HttpException(
          `Role with ${role_id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      const foundPerms = await this.permRoleService.findPermsByIds(
        perms.map((p) => p.perm_id),
      );
      const hashedPassword = await Hash.encrypt('password');
      let admin: Admin;
      let createdAdminPermissions: AdminPermission[];
      await this.entityManager.transaction(async (transactionManager) => {
        const newAdmin = this.adminRepo.create({
          last_name,
          first_name,
          email,
          role: foundRole,
          designation,
          password: hashedPassword,
        });
        admin = await transactionManager.save(newAdmin);
        if (foundPerms.length) {
          const adminPermissions: AdminPermission[] = [];
          for (const perm of perms) {
            const { active, perm_id } = perm;
            const foundPerm = foundPerms.find((p) => p.id === perm_id);
            if (foundPerm) {
              adminPermissions.push({
                admin_id: admin.id,
                admin,
                permission: foundPerm,
                active,
                perm_id,
              });
            }
          }
          if (adminPermissions.length) {
            const manyAdminPermissions =
              this.adminPermRepo.create(adminPermissions);
            createdAdminPermissions = await transactionManager.save(
              manyAdminPermissions,
            );
            admin.permissions = createdAdminPermissions;
          }
        }
        await transactionManager.save(admin);
      });
      return admin;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async acceptInvite(adminAcceptInviteDto: AdminAcceptInviteDto) {}

  async findAdminByEmail(email: string): Promise<Admin> {
    try {
      const res = await this.adminRepo.findOne({
        where: { email, is_deleted: false },
      });
      return res;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getAdminById(adminId: string) {
    try {
      return await this.adminRepo
        .createQueryBuilder('admin')
        .where('admin.id = :adminId', { adminId })
        .leftJoinAndSelect('admin.role', 'role')
        .leftJoinAndSelect('admin.permissions', 'perms')
        .getOne();
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, adminId: string) {
    try {
      const updateResult = await this.adminRepo
        .createQueryBuilder('admin')
        .update(Admin)
        .set({ two_fa_secret: secret })
        .where('admin.id = :adminId', { adminId })
        .execute();
      return updateResult;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async toggleTwoFactorAuthentication(adminId: string, enableTwoFa: boolean) {
    try {
      const updateResult = await this.adminRepo
        .createQueryBuilder('admin')
        .update(Admin)
        .set({ is_two_fa_enabled: enableTwoFa })
        .where('admin.id = :adminId', { adminId })
        .execute();
      return updateResult;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
