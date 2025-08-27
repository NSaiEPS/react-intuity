// import { alpha } from '@mui/material/styles';
import dayjs from "dayjs";
import CryptoJS from "crypto-js";

export const colors = {
  darkBlue: "#172D56",
  blue: "#2A72B9",
  white: "#ffffff",
  "blue.1": "#B3D9F5",
  "blue.2": "#85B7E1",
  "blue.3": "#5894CD",
  "blue.4": "#E3F2FD",
};
export const colorPalette = [
  colors.blue,
  colors["blue.2"],
  "#f47216", // Orange
  "#00e", // Blue
  "#1abc9c", // Teal
  "#f39c12", // Yellow-Orange
  "#8e44ad", // Purple
  "#e74c3c", // Red
  "#3498db", // Sky Blue
  "#2ecc71", // Green
  "#9b59b6", // Lavender
  "#16a085", // Dark Teal
  "#e67e22", // Burnt Orange
  "#d35400", // Dark Orange
  "#2980b9", // Medium Blue
  "#27ae60", // Rich Green
  "#c0392b", // Deep Red
  "#7f8c8d", // Gray
  "#34495e", // Navy Gray
  "#95a5a6", // Light Gray
  "#bdc3c7", // Soft Silver
  "#2c3e50", // Charcoal
];

export const getTodayDate = (format: string) => {
  const today = dayjs().format("YYYY-MM-DD");
  if (format) {
    return dayjs(today).format(format);
  }
  return today;
};

export function formatToMMDDYYYY(
  dateString?: string,
  time?: boolean,
  name?: boolean,
  backtype?: boolean
) {
  if (time) {
    if (!dateString) return dayjs().format("MM-DD-YYYY, HH:mm:ss");
    const date = dayjs(dateString);
    return date.isValid() ? date.format("MM-DD-YYYY, HH:mm:ss") : "-";
  } else if (name) {
    if (!dateString) return dayjs().format("MM-DD-YYYY");
    const date = dayjs(dateString);
    return date.isValid() ? date.format("MMM DD, YYYY") : "-";
  } else if (backtype) {
    if (!dateString) return dayjs().format("MM-DD-YYYY");
    const date = dayjs(dateString);
    return date.isValid() ? date.format("MM/DD/YYYY") : "-";
  } else {
    if (!dateString) return dayjs().format("MM-DD-YYYY");
    const date = dayjs(dateString);
    return date.isValid() ? date.format("MM-DD-YYYY") : "-";
  }
}

export const boarderRadius = {
  sm: "4px",
  md: "8px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "40px",
  card: "8px",
};
export function getCurrentCompanySlug(): string | undefined {
  if (typeof window === "undefined") return undefined; // SSR-safe
  const pathParts = window.location.pathname.split("/");
  // console.log(pathParts, 'pathPartspathParts');
  if (pathParts.length > 1 && pathParts[1] !== "intuityfe") {
    return pathParts?.includes("register") ? pathParts[2] : pathParts[1];
  }
  return undefined;
}

type PaymentConfig = {
  config_data_card?: Record<string, any>;
  config_data_ach?: Record<string, any>;
  [key: string]: any;
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
  const parseNum = (v: any) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const base = parseNum(amount);
  // PHP only calculates when amount > 0 in the keyup path — follow that
  if (base <= 0)
    return {
      baseAmount: base,
      convenienceFee: 0.0,
      total: Number(base.toFixed(2)),
    };

  let conv = 0;
  const cardConfig = (config && config.config_data_card) || {};
  const achConfig = (config && config.config_data_ach) || {};

  // Helper to compute same branching logic as PHP for a group of (fixed, percentage, minimum)
  function computeFeeFromFields(baseAmount, fixedField, percField, minField) {
    const fixed = parseNum(fixedField);
    const perc = parseNum(percField);
    const minimum = parseNum(minField);

    if (fixed > 0 && perc > 0) {
      conv = (baseAmount * perc) / 100 + fixed;
      conv = Number(conv.toFixed(2)); // PHP does rounding here
      return conv > minimum ? conv : minimum;
    } else if (perc > 0) {
      conv = Number(((baseAmount * perc) / 100).toFixed(2));
      return conv > minimum ? conv : minimum;
    } else if (fixed > 0) {
      conv = Number(fixed.toFixed(2));
      return conv > minimum ? conv : minimum;
    } else {
      // fallback to minimum (even if zero)
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

export function decryptFunction(encrypted: string): string {
  const keyString = "Intuity";
  const ivString = "1234567891011121";

  try {
    // If the value is just a plain number/string with `**`, return masked
    if (!encrypted || /^\d+$/.test(encrypted) || encrypted.includes("**")) {
      return maskValue(encrypted);
    }

    // Decode base64 to bytes
    const ciphertext = CryptoJS.enc.Base64.parse(encrypted);

    // Create key/iv as WordArrays
    const key = CryptoJS.enc.Utf8.parse(keyString.padEnd(16, "\0"));
    const iv = CryptoJS.enc.Utf8.parse(ivString);

    // AES CTR decrypt
    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
      iv,
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding,
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);

    return maskValue(result || encrypted);
  } catch (err) {
    return maskValue(encrypted);
  }
}

function maskValue(value: string): string {
  if (!value) return value;

  const last4 = value.slice(-4);
  return "********" + last4;
}
