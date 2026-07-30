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
    key: "billing-payments",
    title: "Billing & Payments",
    icon: "currency",
    items: [
      {
        key: "last-bill",
        title: "Last Bill",
        icon: "currency",
        href: paths.dashboard.lastBill(getCurrentCompanySlug()),
        pathFun: paths.dashboard.lastBill(),
      },
      {
        key: "auto-pay",
        title: "Manage AutoPay",
        icon: "plugs-connected",
        href: paths.dashboard.autoPay(),
        pathFun: paths.dashboard.autoPay(),
      },
      {
        key: "payment-methods",
        title: "Payment Methods",
        icon: "credit",
        href: paths.dashboard.paymentMethods(),
        pathFun: paths.dashboard.paymentMethods(),
      },
      {
        key: "prior-bills",
        title: "Billing History",
        icon: "receipt",
        href: paths.dashboard.priorBills(),
        pathFun: paths.dashboard.priorBills(),
      },
    ],
  },
  {
    key: "history",
    title: "Usage History",
    href: paths.dashboard.usageHistory(),
    icon: "history",
    pathFun: paths.dashboard.usageHistory(),
  },
  {
    key: "my-account",
    title: "My Account",
    icon: "user",
    items: [
      {
        key: "settings",
        title: "Profile",
        icon: "gear-six",
        href: paths.dashboard.settings(),
        pathFun: paths.dashboard.settings(),
      },
      {
        key: "notification-settings",
        title: "Notifications",
        icon: "notification-settings",
        href: paths.dashboard.notificationSettings(),
        pathFun: paths.dashboard.notificationSettings(),
      },
      {
        key: "paperless",
        title: "Go Paperless",
        icon: "paperless",
        href: paths.dashboard.paperless(),
        pathFun: paths.dashboard.paperless(),
      },
      {
        key: "link-account",
        title: "Add Another Account",
        icon: "link-account",
        href: paths.dashboard.linkAccount(),
        pathFun: paths.dashboard.linkAccount(),
      },
    ],
  },
  {
    key: "customer-service",
    title: "Customer Service",
    icon: "users",
    items: [
      {
        key: "service",
        title: "Contact Us",
        description: "Send us a message or ask a question.",
        icon: "users",
        href: paths.dashboard.service(),
        pathFun: paths.dashboard.service(),
      },
      {
        key: "account",
        title: "Update Info",
        description: "Request changes to your account information.",
        icon: "user",
        href: paths.dashboard.account(),
        pathFun: paths.dashboard.account(),
      },
      {
        key: "stop-service",
        title: "Change Service",
        description: "Stop or transfer your utility service.",
        icon: "swap",
        href: paths.dashboard.stopService(),
        pathFun: paths.dashboard.stopService(),
      },
    ],
  },
] satisfies NavItemConfig[];