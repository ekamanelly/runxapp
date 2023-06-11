import { Module, forwardRef } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PermRoleModule } from 'src/perm-role/perm-role.module';
import { AdminPermission } from 'src/entities/admin-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, AdminPermission]),
    forwardRef(() => AuthModule),
    PermRoleModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
