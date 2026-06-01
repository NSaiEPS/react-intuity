/**
 * Shared domain interfaces for the Intuity application.
 *
 * Import from here instead of re-defining inline or using `any`.
 * All shapes are derived from real API responses — add fields as the
 * backend evolves; use `[key: string]: unknown` to allow extra fields
 * without turning off type-checking everywhere.
 */

import type { ReactNode } from 'react';

// ─── Generic API wrapper ────────────────────────────────────────────────────

/** Standard backend envelope: `{ status, message?, body? }` */
export interface ApiResponse<T = Record<string, any>> {
  status: boolean;
  /** Most endpoints return a plain string; some error responses return string[]. */
  message?: string;
  body?: T;
}

// ─── Shared callback helpers ─────────────────────────────────────────────────

/** Callback that toggles a loading flag. */
export type SetLoadingFn = (loading: boolean) => void;

// ─── Customer / User ─────────────────────────────────────────────────────────

export interface CustomerAccount {
  customer_id?: string;
  acl_role_id?: string;
  token?: string;
  email?: string;
  alias?: string;
  is_verified?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  account_number?: string;
  [key: string]: any;
}

/** Body of the `intuity-user` secure-storage item (full login response). */
export interface IntuityUserBody extends CustomerAccount {
  body?: CustomerAccount;
}

// ─── Company ─────────────────────────────────────────────────────────────────

export interface CompanyDetails {
  country?: string;
  phone?: string;
  email?: string;
  company_website?: string;
  company_website_URL?: string;
  company_name?: string;
  alias?: string;
  company_id?: string | number;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  /** 1 = two-factor auth is required for this company */
  require_2fa?: number;
  [key: string]: any;
}

/** Body of `getCompanyDetailsApi` response — stored in `state.Account.companyInfo`. */
export interface CompanyInfoBody {
  company?: CompanyDetails;
  [key: string]: any;
}

// ─── Confirm Information ─────────────────────────────────────────────────────

export interface ConfirmInfoBody {
  customer?: CustomerAccount;
  /** Multiple accounts returned after confirm-information */
  customers?: CustomerAccount[];
  company?: CompanyDetails;
  confirm_information_status?: boolean;
  two_fa_status?: boolean;
  [key: string]: any;
}

// ─── Account Info ─────────────────────────────────────────────────────────────

export interface AccountInfoBody {
  customer?: CustomerAccount;
  [key: string]: any;
}

// ─── Payment Methods ─────────────────────────────────────────────────────────

export interface PaymentCard {
  card_id?: string | number;
  card_no?: string;
  card_type?: string;
  expiration?: string;
  is_default?: boolean | number;
  [key: string]: any;
}

export interface PaymentDetailsBody {
  mycards?: PaymentCard[];
  selected_card?: PaymentCard | null;
  worldpay_transaction_set_up_id?: string;
  customer?: CustomerAccount;
  autopay_card?: PaymentCard;
  autopay_setting?: Record<string, any>;
  [key: string]: any;
}

// ─── One-Time / Guest Payment ────────────────────────────────────────────────

export interface OneTimePaymentBody {
  customer?: CustomerAccount;
  is_payments_blocked?: boolean;
  /** Invoice fields — present when guest-payment API returns billing info */
  bill_items?: any;
  invoice?: any;
  invoice_subheadline?: string;
  invoice_text_header_email?: string;
  [key: string]: any;
}

// ─── Convenience Fee ─────────────────────────────────────────────────────────

export interface ConvenienceFeeBody {
  fee_amount?: number;
  fee_percentage?: number;
  /** Used by calculatePaymentAmount for card fee config */
  config_data_card?: any;
  /** Used by calculatePaymentAmount for ACH fee config */
  config_data_ach?: any;
  [key: string]: any;
}

// ─── Payment Processor ───────────────────────────────────────────────────────

export interface PaymentProcessorBody {
  processor_name?: string;
  processor_id?: string | number;
  [key: string]: any;
}

// ─── Usage Alerts ────────────────────────────────────────────────────────────

export interface UsageAlertsBody {
  [key: string]: any;
}

// ─── Notification Preferences ────────────────────────────────────────────────

export interface NotificationPreferencesBody {
  otp?: string;
  notification_email_message?: string;
  autopay_card?: PaymentCard;
  autopay_setting?: Record<string, any>;
  [key: string]: any;
}

// ─── Transfer Service ────────────────────────────────────────────────────────

export interface TransferInfoBody {
  [key: string]: any;
}

// ─── Dashboard (home) ────────────────────────────────────────────────────────

export interface DashboardBody {
  customer?: CustomerAccount;
  company?: CompanyDetails;
  linked_customers?: CustomerAccount[];
  meterDetails?: Record<string, any>;
  [key: string]: any;
}

/** Full home-API response (status + body). Stored in `state.DashBoard.dashBoardInfo`. */
export interface DashboardResponse extends ApiResponse<DashboardBody> {}

// ─── Last Bill ───────────────────────────────────────────────────────────────

export interface LastBillBody {
  billing_list?: Record<string, any>;
  block_individual_customer_payment_text?: string;
  payment_pending?: any;
  recurring_payment_msg1?: any;
  autopay_text?: any;
  schedule_payment_text?: string;
  pay_now_text?: any;
  schedule_payment_msg?: any;
  achworks_pay_now_text?: any;
  nacha_pay_now_text?: any;
  last_bill?: Record<string, any>;
  customer_acknowledgement_text?: any;
  get_recurring_payments?: any;
  customer?: CustomerAccount;
  text_autopay_billing?: string;
  pending_payment?: any;
  pending_payment_text?: boolean;
  company?: CompanyDetails;
  id?: string;
  amount?: number;
  dueDate?: string;
  [key: string]: any;
}

// ─── Usage ───────────────────────────────────────────────────────────────────

export interface UsageGraphBody {
  [key: string]: any;
}

export interface InvoiceDetailsBody {
  [key: string]: any;
}

// ─── Register ────────────────────────────────────────────────────────────────

export interface RegisterResponseBody {
  customer_id?: string;
  acl_role_id?: string;
  token?: string;
  [key: string]: any;
}
