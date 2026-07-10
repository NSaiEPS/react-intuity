import dayjs from "dayjs";

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

// format currency in this format "xx,xxx.xx"
export const formatCurrency = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const cleanValue = String(value).replace(/,/g, "");

  const numberValue = Number(cleanValue);

  if (Number.isNaN(numberValue)) {
    return String(value);
  }

  return numberValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};