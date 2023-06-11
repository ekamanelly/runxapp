import { BankAccount } from 'src/entities/bank-account.entity';
// import { TransactionStatus } from './transaction.interface';

// export interface SpWallet {
//   escrow: number;
//   hold: number;
//   available_balance: number;
// }
// export interface ClientWallet {
//   escrow: number;
//   available_balance: number;
//   totalPendingFunding: number;
// }

export interface SettleFundWalletTransaction {
  reference: string;
  sp_id?: string;
  client_id?: string;
}

// export enum ComputedTransactionStatus {
//   'ALL' = 'ALL',
//   'DEBIT' = 'DEBIT',
//   'CREDIT' = 'CREDIT',
// }

// export interface ComputedTransaction {
//   description: string;
//   amount: number;
//   date: Date;
//   balance: number;
//   status: TransactionStatus;
//   source?: 'CARD';
//   type: ComputedTransactionStatus;
//   destination?: BankAccount;
// }
