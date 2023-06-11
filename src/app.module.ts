import { DatabaseExceptionFilter } from './filters/database.filter';
import { SystemModule } from './system/system.module';
import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MessagingModule } from './messaging/messaging.module';
import configuration from './config/configuration';
import { ServiceTypesModule } from './services-types/service-types.module';
import { APP_FILTER } from '@nestjs/core';
import { ServiceRequestModule } from './service-request/service-request.module';
import { WalletModule } from './wallet/wallet.module';
import { BullModule } from '@nestjs/bull';
import { NotificationModule } from './notification/notification.module';
import { BankAccount } from './entities/bank-account.entity';
import { Transaction } from './entities/transaction.entity';
import { PaymentProcessorModule } from './payment-processor/payment-processor.module';
import { FileModule } from './file/file.module';
import { RatingModule } from './rating/rating.module';
import { ServiceProviderModule } from './service-provider/service-provider.module';
import { InviteModule } from './invite/invite.module';
import { ClientModule } from './client/client.module';
import { AdminModule } from './admin/admin.module';
import { ProposalModule } from './proposal/proposal.module';
import { DisputeModule } from './dispute/dispute.module';
import { ServiceProviderWallet } from './entities/service-provider-wallet.entity';
import { ClientWallet } from './entities/client-wallet.entity';
import { SpRating } from './entities/sp-rating.entity';
import { ClientRating } from './entities/client-rating.entity';
import { AverageSpRatingSubscriber } from './db/subscribers/sp-rating.subscriber';
import { ChatModule } from './chat/chat.module';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { Admin } from './entities/admin.entity';
import { AdminAuditTrail } from './entities/admin-audit-trail.entity';
import { Chat } from './entities/chat.entity';
import { AdminPermission } from './entities/admin-permission.entity';
// import { ThrottlerModule } from '@nestjs/throttler';
import { PermRoleModule } from './perm-role/perm-role.module';
import { AdminAuditTrailModule } from './admin-audit-trail/admin-audit-trail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolePermission } from './entities/role-permission.entity';
import { ChatHead } from './entities/chat-head.entity';
@Module({
  imports: [
    ChatModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const creds: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          entities: [
            __dirname + '/entities/**/*.entity{.ts,.js}',
            BankAccount,
            Transaction,
            SpRating,
            ClientRating,
            ServiceProviderWallet,
            ClientWallet,
            Permission,
            Role,
            RolePermission,
            Admin,
            AdminAuditTrail,
            Chat,
            AdminPermission,
          ],
          synchronize: true,
          autoLoadEntities: true,
          subscribers: [AverageSpRatingSubscriber],
        };
        return creds;
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
          username: configService.get<string>('redis.username'),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    AuthModule,
    MessagingModule,
    SystemModule,
    ServiceTypesModule,
    ServiceRequestModule,
    WalletModule,
    NotificationModule,
    PaymentProcessorModule,
    FileModule,
    RatingModule,
    ServiceProviderModule,
    InviteModule,
    ClientModule,
    AdminModule,
    ProposalModule,
    DisputeModule,
    PermRoleModule,
    AdminAuditTrailModule,
    ChatHead,

    // ThrottlerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     ttl: configService.get('throttle.ttl'),
    //     limit: configService.get('throttle.limit'),
    //   }),
    // }),
  ],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: DatabaseExceptionFilter },
  ],
  controllers: [AppController],
})
export class AppModule {}
