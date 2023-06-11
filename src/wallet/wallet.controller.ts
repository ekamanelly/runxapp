import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guide';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoles } from 'src/users/interfaces/user.interface';
import { WalletService } from './wallet.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/entities/user.entity';
import { PaginationResponse } from 'src/common/interface';
import { Transaction } from 'src/entities/transaction.entity';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { VerifyBankAccountDto } from './dto/verify-bank-account.dto';
import { VerifyBankAccount } from 'src/payment-processor/interface/paystack.interface';
import { BankAccount } from 'src/entities/bank-account.entity';
import { MakeDefaultBankAccountDto } from './dto/make-default-bank-account.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { ServiceProviderWallet } from 'src/entities/service-provider-wallet.entity';
import { ClientWallet } from 'src/entities/client-wallet.entity';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('sp')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  @HttpCode(200)
  async spWallet(
    @CurrentUser() currentUser: User,
  ): Promise<ServiceProviderWallet> {
    return await this.walletService.getServiceProviderWallet(currentUser, true);
  }

  @Get('client')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  @HttpCode(200)
  async clientWallet(@CurrentUser() currentUser: User): Promise<ClientWallet> {
    return await this.walletService.getClientWallet(currentUser, true);
  }

  @Get('transaction/client')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  @HttpCode(200)
  async clientTransaction(
    @CurrentUser() currentUser: User,
    @Query() transactionQueryDto: TransactionQueryDto,
  ) {
    return await this.walletService.clientTransactions(
      currentUser,
      transactionQueryDto,
    );
  }
  @Get('transaction/sp')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  @HttpCode(200)
  async serviceProviderTransaction(
    @CurrentUser() currentUser: User,
    @Query() transactionQueryDto: TransactionQueryDto,
  ): PaginationResponse<Transaction> {
    return await this.walletService.serviceProviderTransactions(
      currentUser,
      transactionQueryDto,
    );
  }

  @Post('fund')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.CLIENT)
  @HttpCode(200)
  async fundWalletTransaction(
    @CurrentUser() currentUser: User,
    @Body() fundWalletDto: FundWalletDto,
  ) {
    return await this.walletService.fundWallet(currentUser, fundWalletDto);
  }

  @Post('bank-account/add')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async addBankAccount(
    @Body() addBankAccountDto: AddBankAccountDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.walletService.addBankAccount(
      currentUser,
      addBankAccountDto,
    );
  }

  @Get('bank-account/list')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async listBankAccount(@CurrentUser() currentUser: User) {
    return await this.walletService.listBankAccount(currentUser);
  }

  @Post('bank-account/verify')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async verifyBankAccount(
    @Body() verifyBankAccountDto: VerifyBankAccountDto,
  ): Promise<Partial<VerifyBankAccount['data']>> {
    return await this.walletService.verifyBankAccount(verifyBankAccountDto);
  }

  @Post('bank-account/make-default')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async makeDefaultBankAccount(
    @Body() makeDefaultBankAccountDto: MakeDefaultBankAccountDto,
    @CurrentUser() currentUser: User,
  ): Promise<BankAccount[]> {
    return await this.walletService.makeDefaultBankAccount(
      currentUser,
      makeDefaultBankAccountDto,
    );
  }

  @Delete('bank-account/id/:bankAccountId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRoles.SERVICE_PROVIDER)
  async deleteBankAccount(@Param('bankAccountId') bankAccountId: string) {
    return await this.walletService.deleteBankAccount(bankAccountId);
  }
}
