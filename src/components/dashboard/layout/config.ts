import { getCurrentCompanySlug } from "@/utils";

import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/utils/paths";

export const navItems = [
  {
    key: "overview",
    title: "Overview",
    href: paths.dashboard.overview(getCurrentCompanySlug()),
    icon: "chart-pie",
    pathFun: paths.dashboard.overview(),
  },
  {
    key: "pay-now",
    title: "Pay Now",
    href: paths.dashboard.payNow(getCurrentCompanySlug()),
    icon: "currency",
    pathFun: paths.dashboard.payNow(),
  },
  {
    key: "notification-settings",
    title: "Notification Settings",
    href: paths.dashboard.notificationSettings(),
    icon: "notification-settings",
    pathFun: paths.dashboard.notificationSettings(),
  },
  {
    key: "auto-pay",
    title: "Setup Auto Pay",
    href: paths.dashboard.autoPay(),
    icon: "plugs-connected",
    pathFun: paths.dashboard.autoPay(),
  },

  {
    key: "paperless",
    title: "Go Paperless ",
    href: paths.dashboard.paperless(),
    icon: "paperless",
    pathFun: paths.dashboard.paperless(),
  },
  {
    key: "payment-methods",
    title: "My Payment Methods ",
    href: paths.dashboard.paymentMethods(),
    icon: "credit",
    pathFun: paths.dashboard.paymentMethods(),
  },
  {
    key: "prior-bills",
    title: "Prior Bills and Payments",
    href: paths.dashboard.priorBills(),
    icon: "receipt",
    pathFun: paths.dashboard.priorBills(),
  },
  {
    key: "history",
    title: "Usage History",
    href: paths.dashboard.usageHistory(),
    icon: "history",
    pathFun: paths.dashboard.usageHistory(),
  },
  {
    key: "service",
    title: "Customer Service",
    href: paths.dashboard.service(),
    icon: "users",
    pathFun: paths.dashboard.service(),
  },
  {
    key: "settings",
    title: "Update User ID & Password",
    href: paths.dashboard.settings(),
    icon: "gear-six",
    pathFun: paths.dashboard.settings(),
  },
  {
    key: "account",
    title: "Account Update Request",
    href: paths.dashboard.account(),
    icon: "user",
    pathFun: paths.dashboard.account(),
  },
  {
    key: "stop-service",
    title: " Stop/Transfer Service",
    href: paths.dashboard.stopService(),
    icon: "swap",
    pathFun: paths.dashboard.stopService(),
  },

  {
    key: "link-account",
    title: "Link Accounts",
    href: paths.dashboard.linkAccount(),
    icon: "link-account",
    pathFun: paths.dashboard.linkAccount(),
  },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
