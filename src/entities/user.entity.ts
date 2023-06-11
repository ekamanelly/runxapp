import { Proposal } from 'src/entities/proposal.entity';
import { ServiceRequest } from 'src/entities/service-request.entity';
import { ServiceType } from 'src/entities/service-type.entity';
import {
  Column,
  Entity,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BankAccount } from './bank-account.entity';
import { ServiceProviderWallet } from './service-provider-wallet.entity';
import { ClientWallet } from './client-wallet.entity';
import { Transaction } from './transaction.entity';
import { SpRating } from './sp-rating.entity';
import { ClientRating } from './client-rating.entity';
import { BaseUser } from './base-user.entity';

@Entity()
export class User extends BaseUser {
  @Column({ nullable: true })
  is_client: boolean;

  @Column({ nullable: true })
  is_sp: boolean;

  @Column({ nullable: true })
  is_phone_verified: boolean;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avai_status: string;

  @Column({ nullable: true, default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  verified_at: Date;

  @Column({ nullable: true })
  loc_geo: string;

  @Column({ nullable: true, default: true })
  is_avai: boolean;

  @Column({ nullable: true })
  loc_postcode: string;

  @Column({ nullable: true })
  loc_land_mark: string;

  @Column({ nullable: true })
  loc_street: string;

  @Column({ nullable: true })
  loc_lga: string;

  @Column({ nullable: true })
  loc_town: string;

  @Column({ nullable: true })
  loc_region: string;

  @Column({ nullable: true })
  ver_doc: string;

  @Column({ nullable: true })
  profession: string;

  @Column({ nullable: true })
  amount_per_hour: number;

  @Column({ nullable: true })
  sp_average_rating: number;

  @Column({ nullable: true })
  trnx_pin: string;

  @Column({ default: false })
  has_trnx_pin: boolean;

  // relations
  @ManyToMany(() => ServiceType)
  @JoinTable()
  service_types: ServiceType[];

  @OneToMany(
    () => ServiceRequest,
    (serviceRequest) => serviceRequest.created_by,
  )
  service_requests: ServiceRequest[];

  @OneToMany(() => Proposal, (srp) => srp.service_provider)
  service_request_proposals: Proposal[];

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.user)
  bank_accounts: BankAccount[];

  @OneToOne(() => ServiceProviderWallet, (sp) => sp.user)
  sp_wallet: ServiceProviderWallet;

  @OneToOne(() => ClientWallet, (clientWallet) => clientWallet.user)
  client_wallet: ClientWallet;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => SpRating, (spRating) => spRating.user)
  sp_ratings: SpRating[];

  @OneToMany(() => ClientRating, (clientRating) => clientRating.user)
  client_ratings: ClientRating[];
}
