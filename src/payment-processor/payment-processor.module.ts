import { Module, forwardRef } from '@nestjs/common';
import { PaymentProcessorService } from './payment-processor.service';
import { PaymentProcessorController } from './payment-processor.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  controllers: [PaymentProcessorController],
  providers: [PaymentProcessorService],
  exports: [PaymentProcessorService],
  imports: [HttpModule, forwardRef(() => WalletModule)],
})
export class PaymentProcessorModule {}
