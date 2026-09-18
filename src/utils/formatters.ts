import dayjs from "dayjs";

export const APP_DATE_FORMAT = "MMM D, YYYY";

export const getTodayDate = (format?: string) => {
  const today = dayjs().format("YYYY-MM-DD");
  if (format) {
    return dayjs(today).format(format);
  }
  return today;
};

/**
 * Formats a date string, timestamp, or Date object into the standard application date format (e.g. "Aug 19, 2026").
 * @param date - The date value to format
 * @param format - Optional custom format string, defaults to APP_DATE_FORMAT ("MMM D, YYYY")
 * @param fallback - Optional fallback string if the date is invalid or falsy
 */
export const formatDate = (
  date?: string | number | Date | dayjs.Dayjs | null,
  format: string = APP_DATE_FORMAT,
  fallback: string = "-"
): string => {
  if (!date) return fallback;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format(format) : (typeof date === "string" ? date : fallback);
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
    return date.isValid() ? date.format(APP_DATE_FORMAT) : "-";
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

// format currency in this format "xx,xxx.xx"
export const formatCurrency = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const stringValue = String(value).trim();

  // detect negativity from a minus sign anywhere in the string
  // (handles "-31257", "$-31257", "31257-", etc.)
  const isNegative = /-/.test(stringValue);

  // strip everything except digits and the decimal point
  // (removes "$", ",", "-", whitespace, etc.)
  const numericString = stringValue.replace(/[^0-9.]/g, "");

  if (numericString === "") {
    return String(value);
  }

  let numberValue = Number(numericString);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  if (isNegative) {
    numberValue = -Math.abs(numberValue);
  }

  return numberValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Formats a phone string into standard US registration phone format: (XXX) XXX-XXXX
 */
export const formatUSPhone = (value?: string | number | null): string => {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export interface USStateOption {
  code: string;
  name: string;
}

export const US_STATES: USStateOption[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

