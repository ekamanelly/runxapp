import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { PaymentProcessorService } from './payment-processor.service';

@Controller('payment-processor')
export class PaymentProcessorController {
  constructor(
    private readonly paymentProcessorService: PaymentProcessorService,
  ) {}

  @Post('/paystack/webhook')
  @HttpCode(200)
  async paystackPaymentWebhook(@Body() body: any, @Req() req) {
    return await this.paymentProcessorService.settleFunding(body.reference);
  }
}
