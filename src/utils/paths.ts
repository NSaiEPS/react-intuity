// import { getCurrentCompanySlug } from './utils';

import { getCurrentCompanySlug } from ".";

export const paths = {
  home: (company?: string) =>
    company ? `/${company}/dashboard` : "/intuityfe/dashboard",

  auth: {
    signIn: (company?: string) => (company ? `sign-in` : "/sign-in"),
    signUp: (company?: string) => (company ? `/sign-up` : "/sign-up"),
    resetPassword: (company?: string) =>
      company ? `/reset-password` : "/reset-password",

    confirmInfo: (company?: string) =>
      company
        ? `/${company}/confirm-information`
        : "/intuityfe/confirm-information",

    register: (company?: string) =>
      company ? `/register` : "/RiverPark-1/auth/register",
    newLogin: (company?: string) => (company ? `/login-${company}` : "/login"),
  },

  dashboard: {
    overview: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();

      return slug ? `/${slug}/dashboard` : "/intuityfe/dashboard";
    },
    account: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/account`
        : "/intuityfe/dashboard/account";
    },
    payNow: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/pay-now`
        : "/intuityfe/dashboard/pay-now";
    },
    paperless: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/paperless`
        : "/intuityfe/dashboard/paperless";
    },
    autoPay: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/auto-pay`
        : "/intuityfe/dashboard/auto-pay";
    },
    paymentMethods: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/payment-methods`
        : "/intuityfe/dashboard/payment-methods";
    },
    priorBills: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/prior-bills`
        : "/intuityfe/dashboard/prior-bills";
    },
    usageHistory: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/usage-history`
        : "/intuityfe/dashboard/usage-history";
    },
    service: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/service`
        : "/intuityfe/dashboard/service";
    },
    settings: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/settings`
        : "/intuityfe/dashboard/settings";
    },
    stopService: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/stop-service`
        : "/intuityfe/dashboard/stop-service";
    },
    notificationSettings: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/notification-settings`
        : "/intuityfe/dashboard/notification-settings";
    },
    linkAccount: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/link-account`
        : "/intuityfe/dashboard/link-account";
    },
    invoiceDetails: (id: string, company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/invoice-details?id=${id ?? ""}`
        : `/intuityfe/dashboard/invoice-details?id=${id ?? ""}`;
    },
    paymentDetails: (id: string, company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      return slug
        ? `/${slug}/dashboard/payment-details?id=${id ?? ""}`
        : `/intuityfe/dashboard/payment-details?id=${id ?? ""}`;
    },
  },
  errors: {
    notFound: () => "/errors/not-found",
  },
} as const;
