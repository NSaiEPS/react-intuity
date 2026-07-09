import { getSiteURL } from "@/lib/get-site-url";
import { LogLevel } from "@/lib/logger";

export interface Config {
  site: { name: string; description: string; themeColor: string; url: string };
  logLevel: keyof typeof LogLevel;
}

export const config: Config = {
  site: {
    name: "Intuity",
    description: "",
    themeColor: "#090a0b",
    url: getSiteURL(),
  },
  logLevel:
    (import.meta.env.VITE_LOG_LEVEL as keyof typeof LogLevel) ?? LogLevel.ALL,
};

export const authSlugs = [
  "login",
  "login-RiverPark-1",
  "login-ctutil",
  "login-cape-royale1",
]; // All pages under /auth
export const companySlugs = [
  "intuity",
  "intuityfe",
  "test",
  "RiverPark-1",
  "ctutil",
  "cape-royale1",
  ...authSlugs,
];

export const tooltipSx = {
  backgroundColor: "#E7E6E6",
  color: "#000",
  border: "1px solid #d0cfcf",
  fontSize: "14px",
  lineHeight: 1.4,
  "& .MuiTooltip-arrow": {
    color: "#E7E6E6",
    "&::before": { border: "1px solid #d0cfcf" },
  },
};

// export async function fetchCompanySlugs() {
//   const res = await fetch('https://your-api.com/companies');
//   return await res.json();
// }
