export type VerifyBankAccount = PaystackResponse<{
  account_number: string;
  account_name: string;
  bank_id: number;
}>;

export interface PaystackResponse<T> {
  status: true;
  message: string;
  data: T;
}

export type BankList = PaystackResponse<BankData[]>;
export interface BankData {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: true;
  country: string;
  currency: 'NGN';
  type: 'nuban';
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaystackWebhookBody {
  event: 'customeridentification.success';
  data: {
    customer_id: string;
    customer_code: string;
    email: string;
    identification: {
      country: 'NG';
      type: 'bvn';
      value: string;
    };
  };
}

export interface TransactionData {
  status: boolean;
  message: string | null;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: string | null;
    log: {
      start_time: number;
      time_spent: number;
      attempts: number;
      errors: number;
      success: boolean;
      mobile: boolean;
      input: any[];
      history: {
        type: string;
        message: string;
        time: number;
      }[];
    };
    fees: number;
    fees_split: {
      paystack: number;
      integration: number;
      subaccount: number;
      params: {
        bearer: string;
        transaction_charge: string;
        percentage_charge: string;
      };
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: string | null;
      risk_action: string;
    };
    plan: string | null;
    order_id: string | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    transaction_date: string;
    plan_object: {};
    subaccount: {
      id: number;
      subaccount_code: string;
      business_name: string;
      description: string;
      primary_contact_name: string | null;
      primary_contact_email: string | null;
      primary_contact_phone: string | null;
      metadata: string | null;
      percentage_charge: number;
      settlement_bank: string;
      account_number: string;
    };
  };
}
