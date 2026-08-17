import CryptoJS from "crypto-js";

// ── Sub-module re-exports (all existing imports from "@/utils" still work) ──
export { colors, colorPalette } from "./colors";
export { getTodayDate, formatToMMDDYYYY, boarderRadius, fileToBase64 } from "./formatters";
export { dummyCountriesList } from "./countries";

// ── Routing ──────────────────────────────────────────────────────────────────

export function getCurrentCompanySlug(): string | undefined {
  if (typeof window === "undefined") return undefined; // SSR-safe
  const pathParts = window.location.pathname.split("/");
  if (pathParts.length > 1 && pathParts[1] !== "intuityfe") {
    return pathParts?.includes("register") ? pathParts[2] : pathParts[1];
  }
  return undefined;
}

// ── Payment fee calculation ───────────────────────────────────────────────────

type NumericLike = number | string | null | undefined;

interface CardConfig {
  credit_card_amount_convenience_fee?: NumericLike;
  credit_card_percentage_convenience_fee?: NumericLike;
  credit_card_minimum_amount_convenience_fee?: NumericLike;
  credit_card_amex_amount_convenience_fee?: NumericLike;
  credit_card_amex_percentage_convenience_fee?: NumericLike;
  credit_card_amex_minimum_amount_convenience_fee?: NumericLike;
}

interface AchConfig {
  bank_amount_convenience_fee_ach?: NumericLike;
  bank_percentage_convenience_fee_ach?: NumericLike;
  bank_minimum_amount_convenience_fee_ach?: NumericLike;
}

type PaymentConfig = {
  config_data_card?: CardConfig;
  config_data_ach?: AchConfig;
};

export const calculatePaymentAmount = ({
  amount,
  paymentType,
  cardType = "other",
  config = {},
}: {
  amount: number | string;
  paymentType: string;
  cardType?: string;
  config?: PaymentConfig;
}) => {
  const parseNum = (v?: string | number | null) => {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : 0;
  };

  const base = parseNum(amount);
  if (base <= 0)
    return {
      baseAmount: base,
      convenienceFee: 0.0,
      total: Number(base.toFixed(2)),
    };

  let conv = 0;
  const cardConfig = (config && config.config_data_card) || {};
  const achConfig = (config && config.config_data_ach) || {};

  function computeFeeFromFields(
    baseAmount: number,
    fixedField?: NumericLike,
    percField?: NumericLike,
    minField?: NumericLike
  ): number {
    const fixed = parseNum(fixedField);
    const perc = parseNum(percField);
    const minimum = parseNum(minField);

    if (fixed > 0 && perc > 0) {
      conv = (baseAmount * perc) / 100 + fixed;
      conv = Number(conv.toFixed(2));
      return conv > minimum ? conv : minimum;
    } else if (perc > 0) {
      conv = Number(((baseAmount * perc) / 100).toFixed(2));
      return conv > minimum ? conv : minimum;
    } else if (fixed > 0) {
      conv = Number(fixed.toFixed(2));
      return conv > minimum ? conv : minimum;
    } else {
      return minimum;
    }
  }

  if (paymentType === "card") {
    if (cardType === "amex") {
      conv = computeFeeFromFields(
        base,
        cardConfig.credit_card_amex_amount_convenience_fee,
        cardConfig.credit_card_amex_percentage_convenience_fee,
        cardConfig.credit_card_amex_minimum_amount_convenience_fee
      );
    } else {
      conv = computeFeeFromFields(
        base,
        cardConfig.credit_card_amount_convenience_fee,
        cardConfig.credit_card_percentage_convenience_fee,
        cardConfig.credit_card_minimum_amount_convenience_fee
      );
    }
  } else if (paymentType === "bank_account") {
    conv = computeFeeFromFields(
      base,
      achConfig.bank_amount_convenience_fee_ach,
      achConfig.bank_percentage_convenience_fee_ach,
      achConfig.bank_minimum_amount_convenience_fee_ach
    );
  }

  const convenienceFee = Number(conv.toFixed(2));
  const total = Number((base + convenienceFee).toFixed(2));

  return {
    baseAmount: Number(base.toFixed(2)),
    convenienceFee,
    total,
  };
};

// ── Masking / decryption ──────────────────────────────────────────────────────

export function maskValue(value: string): string {
  if (!value) return value;
  const last4 = value.slice(-4);
  return "********" + last4;
}

export function decryptFunction(encrypted: string): string {
  const keyString = "Intuity";
  const ivString = "1234567891011121";

  try {
    if (!encrypted || /^\d+$/.test(encrypted) || encrypted.includes("**")) {
      return maskValue(encrypted);
    }

    const ciphertext = CryptoJS.enc.Base64.parse(encrypted);
    const key = CryptoJS.enc.Utf8.parse(keyString.padEnd(16, "\0"));
    const iv = CryptoJS.enc.Utf8.parse(ivString);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
      iv,
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding,
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    return maskValue(result || encrypted);
  } catch {
    return maskValue(encrypted);
  }
}

// ── Domain interfaces ─────────────────────────────────────────────────────────

export interface CustomerInfo {
  is_voice_optout: number;
  loginID: string;
  user_name: string;
  payment_method_id: string | Blob;
  autopay: number;
  customer_address: string;
  customer_name: string;
  acctnum: number;
  id?: number;
  company_logo?: string;
  paperless?: 0 | 1;
  allow_overpayments?: number;
  balance?: number;
  email?: string;
  company_id?: string;
  paperless_payer_terms_conditions?: string;
}

export interface UtilityItem {
  item: string;
  product_id: string;
  amount: number;
  service_address?: string;
  start_date?: string;
  end_date?: string;
  consumption_days?: number;
  previous_reading?: number | string;
  current_reading?: number | string;
  meter_number?: string;
  consumption?: number | string;
}

export interface WorldPlayDetails {
  account_number: string;
  invoice_amount: string | number;
  company_id: string;
  company_alias: string;
  customer_id: string;
  success_authenticate: string;
  name: string;
  email: string;
  billing_id: string;
  is_one_time: "0" | "1";
  is_card: "0" | "1";
  amount: string | number;
  convenienceFee: string | number;
  totalPayment: string | number;
  paymentType: string;
}
