import { MessagingModule } from './../messaging/messaging.module';
import { ServiceTypesModule } from './../services-types/service-types.module';
import { VerificationCode } from 'src/entities/verification-code.entity';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCodeService } from './../verification-code/verification-code.service';
import { JwtService } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ServiceType } from 'src/entities/service-type.entity';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthModule } from 'src/auth/auth.module';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/entities/admin.entity';
import { PermRoleService } from 'src/perm-role/perm-role.service';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { AdminPermission } from 'src/entities/admin-permission.entity';
import { RolePermission } from 'src/entities/role-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ServiceType,
      VerificationCode,
      Admin,
      Role,
      Permission,
      RolePermission,
      AdminPermission,
    ]),
    ServiceTypesModule,
    MessagingModule,
    WalletModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    JwtService,
    VerificationCodeService,
    AdminService,
    PermRoleService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
