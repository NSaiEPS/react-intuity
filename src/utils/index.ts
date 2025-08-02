// import { alpha } from '@mui/material/styles';
import dayjs from "dayjs";

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
