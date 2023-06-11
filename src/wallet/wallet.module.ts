import { Module, forwardRef } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { BankAccount } from 'src/entities/bank-account.entity';
import { User } from 'src/entities/user.entity';
import { PaymentProcessorModule } from 'src/payment-processor/payment-processor.module';
import { NotificationModule } from 'src/notification/notification.module';
import { MessagingModule } from 'src/messaging/messaging.module';
import { ServiceProviderWallet } from 'src/entities/service-provider-wallet.entity';
import { ClientWallet } from 'src/entities/client-wallet.entity';
import { SystemModule } from 'src/system/system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      BankAccount,
      User,
      ServiceProviderWallet,
      ClientWallet,
    ]),
    forwardRef(() => PaymentProcessorModule),
    NotificationModule,
    MessagingModule,
    // SystemModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
