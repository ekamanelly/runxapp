import {
  TransactionType,
  TransactionEvent,
  TransactionWallet,
  TransactionStatus,
} from 'src/wallet/interfaces/transaction.interface';
import { EntityManager, Repository } from 'typeorm';
import { Transaction } from './../entities/transaction.entity';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { BankAccount } from 'src/entities/bank-account.entity';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { User } from 'src/entities/user.entity';
import { CatchErrorException, InSufficientFundException } from 'src/exceptions';
import { PaymentProcessorService } from 'src/payment-processor/payment-processor.service';
import { paginateArray, verifyNamesInString } from 'src/common/utils';
import { SettleFundWalletTransaction } from './interfaces/wallet.interface';
import { ActionCreator, PaginationResponse } from 'src/common/interface';
import { paginate } from 'nestjs-typeorm-paginate';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Proposal } from 'src/entities/proposal.entity';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { VerifyBankAccountDto } from './dto/verify-bank-account.dto';
import { VerifyBankAccount } from 'src/payment-processor/interface/paystack.interface';
import { MakeDefaultBankAccountDto } from './dto/make-default-bank-account.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { ClientWallet } from 'src/entities/client-wallet.entity';
import { ServiceProviderWallet } from 'src/entities/service-provider-wallet.entity';
import { ResponseMessage } from 'src/common/interface/success-message.interface';
import { SystemService } from 'src/system/system.service';
import { ProposalStatus } from 'src/proposal/proposal.interface';
import { TRANSACTION_DESCRIPTIONS } from './wallet.constant';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,

    @Inject(forwardRef(() => PaymentProcessorService))
    private readonly paymentProcessorService: PaymentProcessorService,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,

    @InjectRepository(ServiceProviderWallet)
    private readonly spWalletRepo: Repository<ServiceProviderWallet>,

    @InjectRepository(ClientWallet)
    private readonly clientWalletRepo: Repository<ClientWallet>, // private readonly systemService: SystemService,
  ) {}

  async addBankAccount(
    currentUser: User,
    addBankAccountDto: AddBankAccountDto,
  ): Promise<Partial<BankAccount>> {
    try {
      const { account_number, bank_code } = addBankAccountDto;
      const existingBankAccount = await this.bankAccountRepo
        .createQueryBuilder('bk')
        .leftJoinAndSelect('bk.user', 'user')
        .where('bk.user.id = :id', { id: currentUser.id })
        .where('bk.account_number = :id', {
          id: account_number,
        })
        .getOne();
      if (existingBankAccount) {
        if (existingBankAccount.user.id === currentUser.id) {
          throw new HttpException(
            'Bank account already exist for your account',
            HttpStatus.BAD_REQUEST,
          );
        }
        throw new HttpException(
          'Bank account already exists in our system. Please choose a different account or contact support for assistance',
          HttpStatus.CONFLICT,
        );
      }
      const serverBankAccount =
        await this.paymentProcessorService.verifyBankAccountNumber(
          account_number,
          bank_code,
        );
      const isMatchedNames = verifyNamesInString(
        serverBankAccount.data.account_name,
        currentUser.first_name,
        currentUser.last_name,
      );
      if (!isMatchedNames) {
        throw new HttpException(
          'Bank account name does not match your profile account',
          HttpStatus.BAD_REQUEST,
        );
      }
      const newBankAccount = await this.bankAccountRepo.create({
        ...addBankAccountDto,
        account_name: serverBankAccount.data.account_name,
        user: currentUser,
      });
      const { user, ...rest } = await this.bankAccountRepo.save(newBankAccount);
      return rest;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async verifyBankAccount(
    verifyBankAccountDto: VerifyBankAccountDto,
  ): Promise<Partial<VerifyBankAccount['data']>> {
    try {
      const { account_number, bank_code } = verifyBankAccountDto;
      return await this.paymentProcessorService
        .verifyBankAccountNumber(account_number, bank_code)
        .then((res) => res.data);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async makeDefaultBankAccount(
    currentUser: User,
    makeDefaultBankAccountDto: MakeDefaultBankAccountDto,
  ): Promise<BankAccount[]> {
    try {
      const { id, is_default } = makeDefaultBankAccountDto;
      const bankAccounts = await this.bankAccountRepo.find({
        where: { user: { id: currentUser.id } },
      });
      const updatedBankAccounts = bankAccounts.map((b) =>
        b.id == id ? { ...b, is_default } : { ...b, is_default: false },
      );
      return this.bankAccountRepo.save(updatedBankAccounts);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async deleteBankAccount(bankAccountId: string) {
    try {
      const bankAccount = await this.bankAccountRepo
        .createQueryBuilder()
        .where('id = :id', { id: bankAccountId })
        .getOne();
      if (!bankAccount) {
        throw new NotFoundException('Bank account not found');
      }
      await this.bankAccountRepo
        .createQueryBuilder()
        .delete()
        .where('id = :id', { id: bankAccountId })
        .execute();
      return { message: 'bank account successfully removed' };
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async listBankAccount(currentUser: User) {
    try {
      const bankAccounts = await this.bankAccountRepo
        .createQueryBuilder('bk')
        .where('bk.user.id = :id', { id: currentUser.id })
        .getMany();
      return bankAccounts;
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async acceptProposal(
    client: User,
    sp: User,
    proposal: Proposal,
    transactionEntityManager: EntityManager,
  ): Promise<any> {
    return transactionEntityManager.transaction(async (transactionManager) => {
      console.log('acceptProposal wallet');
      const proposalAmount = proposal.sp_proposal_amount;
      const clientWallet = await this.getClientWallet(client);
      const spWallet = await this.getServiceProviderWallet(sp);

      const clientProposalAmount =
        proposal.sp_proposal_amount + proposal.client_service_fee;
      if (clientProposalAmount > clientWallet.available_balance) {
        throw new InSufficientFundException();
      }
      // debit client
      const debitClientTrnx = new Transaction();
      debitClientTrnx.type = TransactionType.DEBIT;
      debitClientTrnx.proposal;
      debitClientTrnx.event = TransactionEvent.ESCROW;
      debitClientTrnx.amount = clientProposalAmount;
      debitClientTrnx.bal_before = clientWallet.available_balance;
      debitClientTrnx.description = 'Escrow hold for service request';
      debitClientTrnx.bal_after =
        clientWallet.available_balance - clientProposalAmount;
      debitClientTrnx.user = client;
      debitClientTrnx.wallet = TransactionWallet.CLIENT;

      // credit service provider escrow wallet
      const creditSpTrnx = new Transaction();
      creditSpTrnx.type = TransactionType.CREDIT;
      creditSpTrnx.proposal;
      creditSpTrnx.event = TransactionEvent.ESCROW;
      creditSpTrnx.description = 'Escrow hold for service request';
      creditSpTrnx.amount = proposalAmount;
      creditSpTrnx.bal_before = spWallet.available_balance;
      creditSpTrnx.bal_after = spWallet.available_balance;
      creditSpTrnx.user = sp;
      creditSpTrnx.wallet = TransactionWallet.SP;

      // save transactions
      await transactionManager
        .getRepository(Transaction)
        .save([debitClientTrnx, creditSpTrnx]);

      // update service provider wallet
      spWallet.escrow = spWallet.escrow + proposalAmount;
      await transactionManager
        .getRepository(ServiceProviderWallet)
        .save(spWallet);

      // update client wallet
      clientWallet.available_balance =
        clientWallet.available_balance - clientProposalAmount;
      clientWallet.escrow = clientWallet.escrow + clientProposalAmount;
      await transactionManager.getRepository(ClientWallet).save(clientWallet);
    });
  }

  async completeProposal(
    client: User,
    sp: User,
    proposal: Proposal,
    transactionEntityManager: EntityManager,
  ): Promise<any> {
    try {
      return await transactionEntityManager.transaction(
        async (transactionManager) => {
          console.log('completeProposal wallet operation');
          const proposalAmount = proposal.sp_proposal_amount;
          const clientWallet = await this.getClientWallet(client);
          const spWallet = await this.getServiceProviderWallet(sp);

          // credit service provider hold transaction
          const creditSpTrnx = new Transaction();
          creditSpTrnx.type = TransactionType.CREDIT;
          creditSpTrnx.description =
            TRANSACTION_DESCRIPTIONS.creditSPHoldAccount;
          creditSpTrnx.proposal = proposal;
          creditSpTrnx.event = TransactionEvent.HOLD;
          creditSpTrnx.amount = proposalAmount;
          creditSpTrnx.bal_before = spWallet.available_balance;
          creditSpTrnx.bal_after = spWallet.available_balance;
          creditSpTrnx.user = sp;
          creditSpTrnx.wallet = TransactionWallet.SP;

          // save transactions
          await transactionManager
            .getRepository(Transaction)
            .save([creditSpTrnx]);

          // update service provider wallet
          spWallet.escrow = spWallet.escrow - proposalAmount;
          spWallet.hold = spWallet.hold + proposalAmount;
          await transactionManager
            .getRepository(ServiceProviderWallet)
            .save(spWallet);
          await transactionManager
            .getRepository(ClientWallet)
            .save(clientWallet);
        },
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async disputeRefundClient(
    client: User,
    sp: User,
    proposal: Proposal,
    transactionEntityManager: EntityManager,
  ): Promise<any> {
    try {
      return transactionEntityManager.transaction(
        async (transactionManager) => {
          const proposalAmount = proposal.sp_proposal_amount;
          const clientWallet = await this.getClientWallet(client);
          const spWallet = await this.getServiceProviderWallet(sp);
          const clientProposalAmount =
            proposal.sp_proposal_amount + proposal.client_service_fee;

          // credit client
          const debitClientTrnx = new Transaction();
          debitClientTrnx.type = TransactionType.CREDIT;
          debitClientTrnx.proposal;
          debitClientTrnx.event = TransactionEvent.SP_CANCEL;
          debitClientTrnx.amount = proposalAmount;
          debitClientTrnx.description =
            TRANSACTION_DESCRIPTIONS.debitClientTrnx;

          debitClientTrnx.bal_before = clientWallet.available_balance;
          debitClientTrnx.bal_after =
            clientWallet.available_balance + clientProposalAmount;
          debitClientTrnx.user = client;
          debitClientTrnx.wallet = TransactionWallet.CLIENT;

          // debit service provider escrow wallet
          const creditSpTrnx = new Transaction();
          creditSpTrnx.type = TransactionType.DEBIT;
          creditSpTrnx.proposal;
          creditSpTrnx.event = TransactionEvent.SP_CANCEL;
          creditSpTrnx.description =
            'Admin Dispute Cancel service request refund debit escrow';
          creditSpTrnx.amount = proposalAmount;
          creditSpTrnx.bal_before = spWallet.available_balance;
          creditSpTrnx.bal_after = spWallet.escrow - proposalAmount;
          creditSpTrnx.user = sp;
          creditSpTrnx.wallet = TransactionWallet.SP;

          // save transactions
          await transactionManager
            .getRepository(Transaction)
            .save([debitClientTrnx, creditSpTrnx]);

          // update service provider wallet
          if (proposal.status === ProposalStatus.IN_PROGRESS) {
            spWallet.escrow = spWallet.escrow - proposalAmount;
          }
          if (proposal.status === ProposalStatus.AWAITING_PAYMENT) {
            spWallet.hold = spWallet.hold - proposalAmount;
          }
          await transactionManager
            .getRepository(ServiceProviderWallet)
            .save(spWallet);

          // update client wallet
          clientWallet.available_balance =
            clientWallet.available_balance + clientProposalAmount;
          clientWallet.escrow = clientWallet.escrow - clientProposalAmount;
          await transactionManager
            .getRepository(ClientWallet)
            .save(clientWallet);
        },
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async disputePayServiceProvider(
    client: User,
    sp: User,
    proposal: Proposal,
    transactionEntityManager: EntityManager,
  ) {
    try {
      return transactionEntityManager.transaction(
        async (transactionManager) => {
          console.log('disputePayServiceProvider wallet operation');
          const proposalAmount = proposal.sp_proposal_amount;
          const clientWallet = await this.getClientWallet(client);
          const spWallet = await this.getServiceProviderWallet(sp);
          const clientProposalAmount =
            proposal.sp_proposal_amount + proposal.client_service_fee;

          // admin release fund to service provider
          const paySPTrnx = new Transaction();
          paySPTrnx.type = TransactionType.DEBIT;
          paySPTrnx.proposal = proposal;
          paySPTrnx.event = TransactionEvent.PAID_SERVICE_PROVIDER;
          paySPTrnx.amount = proposalAmount;
          paySPTrnx.bal_before = clientWallet.available_balance;
          paySPTrnx.bal_after = clientWallet.available_balance;
          paySPTrnx.description =
            'Admin dispute resolution for completed service';
          paySPTrnx.user = client;
          paySPTrnx.wallet = TransactionWallet.CLIENT;
          console.log({
            proposalAmount,
            sp_service_fee: proposal.sp_service_fee,
          });
          // credit service provider available balance transaction
          const creditSpTrnx = new Transaction();
          creditSpTrnx.type = TransactionType.CREDIT;
          creditSpTrnx.proposal = proposal;
          creditSpTrnx.event = TransactionEvent.PAID_SERVICE_PROVIDER;
          creditSpTrnx.amount = proposalAmount;
          creditSpTrnx.description =
            'Admin Dispute Payment for completed service request released';
          creditSpTrnx.bal_before = spWallet.available_balance;
          creditSpTrnx.bal_after = spWallet.available_balance + proposalAmount;
          creditSpTrnx.user = sp;
          creditSpTrnx.wallet = TransactionWallet.SP;

          // debit service provider service fee transaction
          const debitSpServiceFeeTrnx = new Transaction();
          debitSpServiceFeeTrnx.type = TransactionType.DEBIT;
          debitSpServiceFeeTrnx.proposal = proposal;
          debitSpServiceFeeTrnx.event = TransactionEvent.SP_SERVICE_FEE;
          debitSpServiceFeeTrnx.amount = proposal.sp_service_fee;
          debitSpServiceFeeTrnx.description =
            'Service fee for completed service';
          debitSpServiceFeeTrnx.bal_before = spWallet.available_balance;
          debitSpServiceFeeTrnx.bal_after =
            spWallet.available_balance +
            proposalAmount -
            proposal.sp_service_fee;
          debitSpServiceFeeTrnx.wallet = TransactionWallet.SP;

          // credit system with service provider service fee transaction
          const creditSytemClientServiceFeeTrnx = new Transaction();
          creditSytemClientServiceFeeTrnx.type = TransactionType.CREDIT;
          creditSytemClientServiceFeeTrnx.proposal = proposal;
          creditSytemClientServiceFeeTrnx.event =
            TransactionEvent.SP_SERVICE_FEE;
          creditSytemClientServiceFeeTrnx.amount = proposal.sp_service_fee;
          creditSytemClientServiceFeeTrnx.description =
            'Service Provider service fee for completed service';
          creditSytemClientServiceFeeTrnx.wallet = TransactionWallet.SYSTEM;

          // credit system with client service fee transaction
          const creditSytemSPServiceFeeTrnx = new Transaction();
          creditSytemSPServiceFeeTrnx.type = TransactionType.CREDIT;
          creditSytemSPServiceFeeTrnx.proposal = proposal;
          creditSytemSPServiceFeeTrnx.event =
            TransactionEvent.CLIENT_SERVICE_FEE;
          creditSytemSPServiceFeeTrnx.amount = proposal.client_service_fee;
          creditSytemSPServiceFeeTrnx.description =
            'Service Provider service fee for completed service';
          creditSytemSPServiceFeeTrnx.wallet = TransactionWallet.SYSTEM;

          await transactionManager
            .getRepository(Transaction)
            .save([
              paySPTrnx,
              creditSpTrnx,
              debitSpServiceFeeTrnx,
              creditSytemClientServiceFeeTrnx,
              creditSytemSPServiceFeeTrnx,
            ]);

          // update service provider wallet
          spWallet.available_balance =
            spWallet.available_balance +
            proposalAmount -
            proposal.sp_service_fee;
          if (proposal.status === ProposalStatus.IN_PROGRESS) {
            spWallet.escrow = spWallet.escrow - proposalAmount;
          }
          if (proposal.status === ProposalStatus.AWAITING_PAYMENT) {
            spWallet.hold = spWallet.hold - proposalAmount;
          }
          await transactionManager
            .getRepository(ServiceProviderWallet)
            .save(spWallet);

          // update client wallet
          clientWallet.escrow = clientWallet.escrow - clientProposalAmount;
          await transactionManager
            .getRepository(ClientWallet)
            .save(clientWallet);
        },
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async serviceProviderCancelProposal(
    client: User,
    sp: User,
    proposal: Proposal,
    transactionEntityManager: EntityManager,
  ) {
    try {
      return transactionEntityManager.transaction(
        async (transactionManager) => {
          const proposalAmount = proposal.sp_proposal_amount;
          const clientWallet = await this.getClientWallet(client);
          const spWallet = await this.getServiceProviderWallet(sp);
          const clientProposalAmount =
            proposal.sp_proposal_amount + proposal.client_service_fee;

          // credit client
          const creditClientTrnx = new Transaction();
          creditClientTrnx.type = TransactionType.CREDIT;
          creditClientTrnx.proposal;
          creditClientTrnx.event = TransactionEvent.SP_CANCEL;
          creditClientTrnx.amount = clientProposalAmount;
          creditClientTrnx.description =
            'Refund for service provider cancelled request';
          creditClientTrnx.bal_before = clientWallet.available_balance;
          creditClientTrnx.bal_after =
            clientWallet.available_balance + clientProposalAmount;
          creditClientTrnx.user = client;
          creditClientTrnx.wallet = TransactionWallet.CLIENT;

          // debit service provider escrow wallet
          const debitSpEscrowTrnx = new Transaction();
          debitSpEscrowTrnx.type = TransactionType.DEBIT;
          debitSpEscrowTrnx.proposal;
          debitSpEscrowTrnx.event = TransactionEvent.SP_CANCEL;
          debitSpEscrowTrnx.description =
            'Cancel service request refund debit escrow';
          debitSpEscrowTrnx.amount = proposalAmount;
          debitSpEscrowTrnx.bal_before = spWallet.available_balance;
          debitSpEscrowTrnx.bal_after = spWallet.available_balance;
          debitSpEscrowTrnx.user = sp;
          debitSpEscrowTrnx.wallet = TransactionWallet.SP;

          // save transactions
          await transactionManager
            .getRepository(Transaction)
            .save([creditClientTrnx, debitSpEscrowTrnx]);

          // update service provider wallet
          spWallet.escrow = spWallet.escrow - proposalAmount;
          if (proposal.status === ProposalStatus.IN_PROGRESS) {
            spWallet.escrow = spWallet.escrow - proposalAmount;
          }
          if (proposal.status === ProposalStatus.AWAITING_PAYMENT) {
            spWallet.hold = spWallet.hold - proposalAmount;
          }
          await transactionManager
            .getRepository(ServiceProviderWallet)
            .save(spWallet);

          // update client wallet
          clientWallet.available_balance =
            clientWallet.available_balance + clientProposalAmount;
          clientWallet.escrow = clientWallet.escrow - clientProposalAmount;
          await transactionManager
            .getRepository(ClientWallet)
            .save(clientWallet);
        },
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async clientCancelProposal(
    client: User,
    sp: User,
    proposal: Proposal,
    isLessThan24Hours: boolean,
    transactionEntityManager: EntityManager,
  ) {
    try {
      return await transactionEntityManager.transaction(
        async (transactionManager) => {
          console.log('clientCancelEscrow');
          // const {
          //   cancel_service_fee_percent,
          //   cancel_service_fee_system_share_percent,
          //   cancel_service_fee_sp_share_percent,
          // } = await this.systemService.getSystem();
          const cancel_service_fee_percent = 0.1;
          const cancel_service_fee_system_share_percent = 0.7;
          const cancel_service_fee_sp_share_percent = 0.3;
          const clientProposalAmount =
            proposal.sp_proposal_amount + proposal.client_service_fee;
          console.log({ isLessThan24Hours });
          const fee = isLessThan24Hours
            ? proposal.sp_proposal_amount * cancel_service_fee_percent
            : 0;
          const spCancelFeeShare = fee * cancel_service_fee_sp_share_percent;
          const systemCancelFeeShare =
            fee * cancel_service_fee_system_share_percent;
          const clientWallet = await this.getClientWallet(client);
          const serviceProviderWallet = await this.getServiceProviderWallet(sp);

          // credit client transaction
          const clientCreditTrnx = new Transaction();
          clientCreditTrnx.type = TransactionType.CREDIT;
          clientCreditTrnx.description = `Service cancellation refund`;
          clientCreditTrnx.proposal = proposal;
          clientCreditTrnx.event = TransactionEvent.CLIENT_CANCEL;
          clientCreditTrnx.amount = clientProposalAmount;
          clientCreditTrnx.bal_before = clientWallet.available_balance;
          clientCreditTrnx.bal_after =
            clientWallet.available_balance + clientProposalAmount;
          clientCreditTrnx.user = client;
          clientCreditTrnx.wallet = TransactionWallet.CLIENT;

          // debit service provider escrow
          const debitSPEscrow = new Transaction();
          debitSPEscrow.type = TransactionType.DEBIT;
          debitSPEscrow.description = `Debit service provider escrow`;
          debitSPEscrow.proposal = proposal;
          debitSPEscrow.event = TransactionEvent.ESCROW;
          debitSPEscrow.amount = proposal.sp_proposal_amount;
          debitSPEscrow.bal_before = clientWallet.available_balance;
          debitSPEscrow.bal_after = clientWallet.available_balance;
          debitSPEscrow.user = sp;
          debitSPEscrow.wallet = TransactionWallet.SP;

          if (fee) {
            // debit client cancellation fee
            const clientDebitCancelFeeTrnx = new Transaction();
            clientDebitCancelFeeTrnx.type = TransactionType.DEBIT;
            clientDebitCancelFeeTrnx.description = `Late service cancellation charge`;
            clientDebitCancelFeeTrnx.proposal = proposal;
            clientDebitCancelFeeTrnx.event = TransactionEvent.CLIENT_CANCEL_FEE;
            clientDebitCancelFeeTrnx.amount = fee;
            clientDebitCancelFeeTrnx.bal_before =
              clientWallet.available_balance;
            clientDebitCancelFeeTrnx.bal_after =
              clientWallet.available_balance + clientProposalAmount - fee;
            clientDebitCancelFeeTrnx.user = client;
            clientDebitCancelFeeTrnx.wallet = TransactionWallet.CLIENT;

            // credit the provider
            const creditSPClientCancelFeeTrnx = new Transaction();
            creditSPClientCancelFeeTrnx.type = TransactionType.CREDIT;
            creditSPClientCancelFeeTrnx.description = `Late service cancellation compensation`;
            creditSPClientCancelFeeTrnx.proposal = proposal;
            creditSPClientCancelFeeTrnx.event =
              TransactionEvent.CLIENT_CANCEL_FEE_SP;
            creditSPClientCancelFeeTrnx.amount = spCancelFeeShare;
            creditSPClientCancelFeeTrnx.bal_before =
              serviceProviderWallet.available_balance;
            creditSPClientCancelFeeTrnx.bal_after =
              serviceProviderWallet.available_balance + spCancelFeeShare;
            creditSPClientCancelFeeTrnx.user = sp;
            creditSPClientCancelFeeTrnx.wallet = TransactionWallet.SP;

            // credit the system
            const creditSystemClientCancelFeeTrnx = new Transaction();
            creditSystemClientCancelFeeTrnx.type = TransactionType.CREDIT;
            creditSystemClientCancelFeeTrnx.description = `Late service cancellation compensation`;
            creditSystemClientCancelFeeTrnx.proposal = proposal;
            creditSystemClientCancelFeeTrnx.event =
              TransactionEvent.CLIENT_CANCEL_FEE_SYSTEM;
            creditSystemClientCancelFeeTrnx.amount = systemCancelFeeShare;
            creditSystemClientCancelFeeTrnx.bal_before =
              serviceProviderWallet.available_balance;
            creditSystemClientCancelFeeTrnx.bal_after =
              serviceProviderWallet.available_balance + spCancelFeeShare;
            creditSystemClientCancelFeeTrnx.wallet = TransactionWallet.SYSTEM;
            // save the transactions
            await transactionManager
              .getRepository(Transaction)
              .save([
                clientDebitCancelFeeTrnx,
                creditSPClientCancelFeeTrnx,
                creditSystemClientCancelFeeTrnx,
              ]);
          }

          // save the transactions
          await transactionManager
            .getRepository(Transaction)
            .save([clientCreditTrnx, debitSPEscrow]);

          // update service provider wallet
          serviceProviderWallet.available_balance =
            serviceProviderWallet.available_balance + spCancelFeeShare;
          serviceProviderWallet.escrow =
            serviceProviderWallet.escrow - proposal.sp_proposal_amount;
          await transactionManager
            .getRepository(ServiceProviderWallet)
            .save(serviceProviderWallet);

          // update client wallet
          clientWallet.available_balance =
            clientWallet.available_balance + clientProposalAmount - fee;
          clientWallet.escrow = clientWallet.escrow - clientProposalAmount;
          await transactionManager
            .getRepository(ClientWallet)
            .save(clientWallet);
          return;
        },
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async payServiceProvider(
    client: User,
    sp: User,
    proposal: Proposal,
    transactionEntityManager: EntityManager,
  ) {
    try {
      return await transactionEntityManager.transaction(
        async (transactionManager) => {
          console.log('payServiceProvider wallet operation');
          const proposalAmount = proposal.sp_proposal_amount;
          const clientWallet = await this.getClientWallet(client);
          const spWallet = await this.getServiceProviderWallet(sp);
          const clientProposalAmount =
            proposal.sp_proposal_amount + proposal.client_service_fee;

          // Debit Client pay service provider
          const clientPaySPTrnx = new Transaction();
          clientPaySPTrnx.type = TransactionType.DEBIT;
          clientPaySPTrnx.proposal = proposal;
          clientPaySPTrnx.event = TransactionEvent.PAID_SERVICE_PROVIDER;
          clientPaySPTrnx.amount = clientProposalAmount;
          clientPaySPTrnx.bal_before = clientWallet.available_balance;
          clientPaySPTrnx.bal_after = clientWallet.available_balance;
          clientPaySPTrnx.description =
            'Escrow fund released to service provider';
          clientPaySPTrnx.user = client;
          clientPaySPTrnx.wallet = TransactionWallet.CLIENT;

          // credit service provider available balance transaction
          const creditSpTrnx = new Transaction();
          creditSpTrnx.type = TransactionType.CREDIT;
          creditSpTrnx.proposal = proposal;
          creditSpTrnx.event = TransactionEvent.PAID_SERVICE_PROVIDER;
          creditSpTrnx.amount = proposalAmount;
          creditSpTrnx.description =
            'Payment for completed service request released';
          creditSpTrnx.bal_before = spWallet.available_balance;
          creditSpTrnx.bal_after = spWallet.available_balance + proposalAmount;
          creditSpTrnx.user = sp;
          creditSpTrnx.wallet = TransactionWallet.SP;

          // debit service provider service fee transaction
          const debitSpServiceFeeTrnx = new Transaction();
          debitSpServiceFeeTrnx.type = TransactionType.DEBIT;
          debitSpServiceFeeTrnx.proposal = proposal;
          debitSpServiceFeeTrnx.event = TransactionEvent.SP_SERVICE_FEE;
          debitSpServiceFeeTrnx.amount = proposal.sp_service_fee;
          debitSpServiceFeeTrnx.description =
            'Service fee for completed service';
          debitSpServiceFeeTrnx.bal_before = spWallet.available_balance;
          debitSpServiceFeeTrnx.bal_after =
            spWallet.available_balance +
            proposalAmount -
            proposal.sp_service_fee;
          debitSpServiceFeeTrnx.wallet = TransactionWallet.SP;

          // credit system with service provider fee transaction
          const creditSytemSpServiceFeeTrnx = new Transaction();
          creditSytemSpServiceFeeTrnx.type = TransactionType.CREDIT;
          creditSytemSpServiceFeeTrnx.proposal = proposal;
          creditSytemSpServiceFeeTrnx.event =
            TransactionEvent.SYSTEM_SERVICE_FEE;
          creditSytemSpServiceFeeTrnx.amount = proposal.sp_service_fee;
          creditSytemSpServiceFeeTrnx.wallet = TransactionWallet.SYSTEM;

          // credit system service fee transaction
          const creditSytemClientServiceFeeTrnx = new Transaction();
          creditSytemClientServiceFeeTrnx.type = TransactionType.CREDIT;
          creditSytemClientServiceFeeTrnx.proposal = proposal;
          creditSytemClientServiceFeeTrnx.event =
            TransactionEvent.SYSTEM_SERVICE_FEE;
          creditSytemClientServiceFeeTrnx.amount = proposal.client_service_fee;
          creditSytemClientServiceFeeTrnx.wallet = TransactionWallet.SYSTEM;

          await transactionManager
            .getRepository(Transaction)
            .save([
              clientPaySPTrnx,
              creditSpTrnx,
              debitSpServiceFeeTrnx,
              creditSytemSpServiceFeeTrnx,
              creditSytemClientServiceFeeTrnx,
            ]);

          // update service provider wallet
          spWallet.available_balance =
            spWallet.available_balance +
            proposalAmount -
            proposal.sp_service_fee;
          spWallet.hold = spWallet.hold - proposalAmount;
          await transactionManager
            .getRepository(ServiceProviderWallet)
            .save(spWallet);

          // update client wallet
          clientWallet.escrow = clientWallet.escrow - clientProposalAmount;
          await transactionManager
            .getRepository(ClientWallet)
            .save(clientWallet);
        },
      );
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async fundWallet(currentUser: User, fundWalletDto: FundWalletDto) {
    try {
      const { amount, reference } = fundWalletDto;
      const trnx = await this.transactionRepo.findOne({
        where: {
          reference: reference,
          event: TransactionEvent.PENDING_FUNDING,
        },
      });
      if (trnx) {
        throw new HttpException(
          'Transaction with reference exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      const clientWallet = await this.getClientWallet(currentUser);
      await this.entityManager.transaction(async (transactionManager) => {
        // create funding transaction
        const fundTrnx = new Transaction();
        fundTrnx.type = TransactionType.CREDIT;
        fundTrnx.description = `Wallet Topup`;
        fundTrnx.event = TransactionEvent.PENDING_FUNDING;
        fundTrnx.amount = amount;
        fundTrnx.reference = reference;
        fundTrnx.bal_before = clientWallet.available_balance;
        fundTrnx.bal_after = clientWallet.available_balance + amount;
        fundTrnx.user = currentUser;
        fundTrnx.wallet = TransactionWallet.CLIENT;
        fundTrnx.status = TransactionStatus.NOT_SETTLED;

        // update client wallet
        // TODO: remove remove avialable balance to fund wallet
        clientWallet.available_balance += amount;
        await transactionManager.getRepository(ClientWallet).save(clientWallet);
        await transactionManager.getRepository(Transaction).save(fundTrnx);
      });
      return new ResponseMessage('Transaction successful pending approval');
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async settleFundWalletTransaction(payload: SettleFundWalletTransaction) {
    try {
      if (!payload.reference) {
        throw new HttpException('Refence is requuired', HttpStatus.BAD_REQUEST);
      }
      console.log('settleFundWalletTransaction', { payload });
      const trnx = await this.transactionRepo.findOne({
        where: {
          reference: payload.reference,
          event: TransactionEvent.PENDING_FUNDING,
        },
        relations: { user: true },
      });
      console.log({ trnx });
      if (trnx) {
        if (trnx.status === TransactionStatus.SETTLED) {
          throw new HttpException(
            'Transaction with reference already settled',
            HttpStatus.BAD_REQUEST,
          );
        }
        await this.entityManager.transaction(async (transactionManager) => {
          const clientWallet = await this.getClientWallet(trnx.user);
          // update client wallet
          await transactionManager.getRepository(ClientWallet).save({
            ...clientWallet,
            available_balance: clientWallet.available_balance + trnx.amount,
            pending_funding: clientWallet.pending_funding - trnx.amount,
          });
          trnx.status = TransactionStatus.SETTLED;
          transactionManager.getRepository(Transaction).save(trnx);
        });
      } else {
        console.log('transaction settled error');
        throw new HttpException(
          'Transaction reference not found',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async clientTransactions(
    currentUser: User,
    transactionQueryDto: TransactionQueryDto,
  ) {
    try {
      const { limit, page, type } = transactionQueryDto;
      const query = this.transactionRepo
        .createQueryBuilder('t')
        .leftJoin('t.user', 'user')
        .where('user.id = :id AND t.wallet = :wallet', {
          id: currentUser.id,
          wallet: TransactionWallet.CLIENT,
        })
        .orderBy('t.created_at', 'DESC');
      if (type) {
        query.andWhere('t.type = :type', { type });
      }
      const transactions = await query.getMany();
      return paginateArray(transactions, limit, page);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async serviceProviderTransactions(
    currentUser: User,
    transactionQueryDto: TransactionQueryDto,
  ) {
    try {
      const { limit, page, type } = transactionQueryDto;
      const status = [TransactionEvent.ESCROW, TransactionEvent.HOLD];
      const query = this.transactionRepo
        .createQueryBuilder('t')
        .leftJoin('t.user', 'user')
        .where('user.id = :id AND t.wallet = :wallet', {
          id: currentUser.id,
          wallet: TransactionWallet.SP,
        })
        .orderBy('t.created_at', 'DESC');
      if (type) {
        query.andWhere('t.type = :type', { type });
      }
      const transactions = await query.getMany();
      return paginateArray(transactions, limit, page);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async createServiceProviderWallet(
    user: User,
  ): Promise<ServiceProviderWallet> {
    try {
      console.log('create service provider wallet');
      const spWallet = new ServiceProviderWallet();
      spWallet.created_at = new Date();
      spWallet.escrow = 0;
      spWallet.hold = 0;
      spWallet.available_balance = 0;
      spWallet.user = user;
      spWallet.pending_funding = 0;
      spWallet.withdrawal = 0;
      spWallet.pending_withdrawal = 0;
      return await this.spWalletRepo.save(spWallet);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async createClientWallet(user): Promise<ClientWallet> {
    try {
      console.log('createClientWallet');
      const clientWallet = await this.clientWalletRepo.create({
        created_at: new Date(),
        escrow: 0,
        available_balance: 0,
        user: user,
        pending_funding: 0,
      });
      return await this.clientWalletRepo.save(clientWallet);
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getServiceProviderWallet(
    user: User,
    shallow = false,
  ): Promise<ServiceProviderWallet> {
    try {
      const qb = await this.spWalletRepo
        .createQueryBuilder('w')
        .leftJoin('w.user', 'user')
        .where('user.id = :id', { id: user.id });
      if (shallow) {
        await qb.select([
          'w.escrow',
          'w.hold',
          'w.available_balance',
          'w.pending_funding',
          'w.withdrawal',
          'w.pending_withdrawal',
        ]);
      }
      return await qb.getOne();
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }

  async getClientWallet(user: User, shallow = false): Promise<ClientWallet> {
    try {
      const qb = await this.clientWalletRepo
        .createQueryBuilder('w')
        .leftJoin('w.user', 'user')
        .where('user.id = :id', { id: user.id });
      if (shallow) {
        await qb.select([
          'w.escrow',
          'w.available_balance',
          'w.pending_funding',
        ]);
      }
      return await qb.getOne();
    } catch (error) {
      throw new CatchErrorException(error);
    }
  }
}
