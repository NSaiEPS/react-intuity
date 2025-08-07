// import { getCurrentCompanySlug } from './utils';

import { getCurrentCompanySlug } from ".";

export const paths = {
  // home: (company?: string) => (company ? `/${company}` : '/'),
  home: (company?: string) =>
    company ? `/${company}/dashboard` : "/intuityfe/dashboard",

  auth: {
    signIn: (company?: string) => (company ? `sign-in` : "/sign-in"),
    signUp: (company?: string) => (company ? `/sign-up` : "/sign-up"),
    resetPassword: (company?: string) =>
      company ? `/reset-password` : "/reset-password",
    // confirmInfo: (company?: string) =>
    //   company ? `/confirm-information` : '/confirm-information',
    // confirmInfo: '/auth/confirm-information',
    confirmInfo: (company?: string) =>
      company
        ? `/${company}/confirm-information`
        : "/intuityfe/confirm-information",

    register: (company?: string) =>
      company ? `/register` : "/RiverPark-1/auth/register",
    newLogin: (company?: string) => (company ? `/login-${company}` : "/login"),
  },

  // dashboard: {
  //   overview: (company?: string) => (company ? `/${company}/dashboard` : '/intuityfe/dashboard'),
  //   account: (company?: string) => (company ? `/${company}/dashboard/account` : '/intuityfe/dashboard/account'),
  //   // payNow: (company?: string) => (company ? `/${company}/dashboard/pay-now` : '/intuityfe/dashboard/pay-now'),
  //   payNow: (company?: string) => {
  //     console.log(company, getCurrentCompanySlug(), 'pathPartspathParts');
  //     const slug = company ? company : getCurrentCompanySlug();
  //     return slug ? `/${slug}/dashboard/pay-now` : '/intuityfe/dashboard/pay-now';
  //   },
  //   paperless: (company?: string) => (company ? `/${company}/dashboard/paperless` : '/intuityfe/dashboard/paperless'),
  //   autoPay: (company?: string) => (company ? `/${company}/dashboard/auto-pay` : '/intuityfe/dashboard/auto-pay'),
  //   paymentMethods: (company?: string) =>
  //     company ? `/${company}/dashboard/payment-methods` : '/intuityfe/dashboard/payment-methods',
  //   priorBills: (company?: string) =>
  //     company ? `/${company}/dashboard/prior-bills` : '/intuityfe/dashboard/prior-bills',
  //   usageHistory: (company?: string) =>
  //     company ? `/${company}/dashboard/usage-history` : '/intuityfe/dashboard/usage-history',
  //   service: (company?: string) => (company ? `/${company}/dashboard/service` : '/intuityfe/dashboard/service'),
  //   settings: (company?: string) => (company ? `/${company}/dashboard/settings` : '/intuityfe/dashboard/settings'),
  //   stopService: (company?: string) =>
  //     company ? `/${company}/dashboard/stop-service` : '/intuityfe/dashboard/stop-service',
  //   notificationSettings: (company?: string) =>
  //     company ? `/${company}/dashboard/notification-settings` : '/intuityfe/dashboard/notification-settings',
  //   linkAccount: (company?: string) =>
  //     company ? `/${company}/dashboard/link-account` : '/intuityfe/dashboard/link-account',
  // },
  // dashboard: {
  //   overview: '/dashboard',
  //   account: '/dashboard/account',
  //   'pay-now': '/dashboard/pay-now',
  //   paperless: '/dashboard/paperless',
  //   'auto-pay': '/dashboard/auto-pay',
  //   'payment-methods': '/dashboard/payment-methods',
  //   'prior-bills': '/dashboard/prior-bills',
  //   'usage-history': '/dashboard/usage-history',
  //   service: '/dashboard/service',
  //   settings: '/dashboard/settings',
  //   'stop-service': '/dashboard/stop-service',
  //   'notification-settings': '/dashboard/notification-settings',
  //   'link-account': '/dashboard/link-account',
  // },

  dashboard: {
    overview: (company?: string) => {
      const slug = company ?? getCurrentCompanySlug();
      // console.log(slug, 'slugssss');
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
