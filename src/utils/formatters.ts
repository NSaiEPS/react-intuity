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