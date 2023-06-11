import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CatchErrorException } from 'src/exceptions';
import { BankList, VerifyBankAccount } from './interface/paystack.interface';
import { SupportedCountries } from 'src/system/system.interface';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class PaymentProcessorService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,

    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
  ) {}

  async paystackHttps<T>(method: 'GET' | 'POST', url: string, data?: any) {
    const SECRET_KEY = this.configService.get<string>(
      'paymentProcessor.secretKey',
    );
    const options = {
      method,
      url: 'https://api.paystack.co/' + url,
      headers: {
        'Content-Type': ['application/json', 'application/json'],
        Authorization: `Bearer ${SECRET_KEY}`,
        'cache-control': 'no-cache',
      },
      ...(data && { data: JSON.stringify(data) }),
    };
    try {
      const response = await firstValueFrom(
        this.httpService.request<T>(options),
      );
      return response.data;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async verifyBankAccountNumber(
    bankAccount: string,
    bankCode: string,
  ): Promise<VerifyBankAccount> {
    try {
      const url = `bank/resolve?account_number=${bankAccount}&bank_code=${bankCode}`;
      return await this.paystackHttps<VerifyBankAccount>('GET', url);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getSupportedBanks(country: SupportedCountries) {
    const url = `bank?country=${country}`;
    return await this.paystackHttps<BankList>('GET', url);
  }

  async settleFunding(reference: string) {
    try {
      if (!reference) {
        throw new HttpException(
          'Refenrence is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.walletService.settleFundWalletTransaction({
        reference,
      });
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
