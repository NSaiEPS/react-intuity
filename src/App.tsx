import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import CompanyRouteGuard from "./components/core/company-route-guard";
import { CustomerServiceGuard } from "./components/core/customer-service-guard";
// Wrappers (keep them eager — they’re small and used everywhere)
import ProtectedRoute, {
  Authorization,
  DashboardLayoutWithSuspense,
  LoginSuspense,
} from "./components/core/protectedRoute";
import CardSuccess from "./components/dashboard/integrations/cardSuccess";
import RouteErrorBoundary from "./components/route-error-boundary";
import RegisterSuccess from "./components/auth/register-success";

// SignInPage is eager — it's the first thing every unauthenticated user sees.
// Lazy-loading it only added a skeleton flash with no bundle benefit.
import { SignInPage } from "./components/auth/sign-in-page";

// Lazy imports for all pages
// ConfirmInformation is eager — visited immediately after login in the 2FA/confirm flow.
// Lazy-loading it only added a LoginSkeleton flash before the real data skeleton.
import ConfirmInformation from "./pages/auth/confirm-information/page";
// DashBoardPage is eager — main landing page after login, lazy-loading only added a LoaderFallback flash.
import DashBoardPage from "./pages/dashboard/page";
const LastBillPage = React.lazy(() => import("./pages/dashboard/last-bill/page"));
const AlertsScreen = React.lazy(
  () => import("./pages/dashboard/usage-alerts/page")
);
const NotificationSettingsPage = React.lazy(
  () => import("./pages/dashboard/notification-settings/page")
);
const AutoPayPage = React.lazy(() => import("./pages/dashboard/auto-pay/page"));
const PaperLessPage = React.lazy(
  () => import("./pages/dashboard/paperless/page")
);
const PaymentMethodsPage = React.lazy(
  () => import("./pages/dashboard/payment-methods/page")
);
const PriorBillsPage = React.lazy(
  () => import("./pages/dashboard/prior-bills/page")
);
const UsageHistoryPage = React.lazy(
  () => import("./pages/dashboard/usage-history/page")
);
const CustomerServicePage = React.lazy(
  () => import("./pages/dashboard/service/page")
);
const SettingsPage = React.lazy(
  () => import("./pages/dashboard/settings/page")
);
const AccountPage = React.lazy(() => import("./pages/dashboard/account/page"));
const StopTransferServicePage = React.lazy(
  () => import("./pages/dashboard/stop-service/page")
);
const LinkAccountPage = React.lazy(
  () => import("./pages/dashboard/link-account/page")
);
const InvoiceDetailsPage = React.lazy(
  () => import("./pages/dashboard/invoice-details/page")
);
const PaymentDetailsPage = React.lazy(
  () => import("./pages/dashboard/payment-details/page")
);
const NotFound = React.lazy(() => import("./pages/not-found"));

import { LoaderFallback } from "@/components/core/protectedRoute";

console.log("version 1.1.48")

const withSuspense = (element: React.ReactNode) => {
  return (
    <React.Suspense fallback={<LoaderFallback />}>
      {<>{element}</>}
    </React.Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: LoginSuspense(
      <Authorization>

        <SignInPage />
      </Authorization>
    ),
  },
  {
    path: "/invoice-detail",
    element: LoginSuspense(
      <Authorization>
        <InvoiceDetailsPage />
      </Authorization>
    ),
  },
  {
    path: "/sign-up",
    element: LoginSuspense(
      <Authorization>
        <SignInPage />
      </Authorization>
    ),
  },
  {
    path: "/register-:alias",
    element: LoginSuspense(
      <Authorization>
        <SignInPage />
      </Authorization>
    ),
  },
  {
    path: "/onetime-payment-:alias",
    element: LoginSuspense(
      <Authorization>
        <SignInPage />
      </Authorization>
    ),
  },
  {
    path: "/reset-password",
    element: LoginSuspense(
      <Authorization>
        <SignInPage />
      </Authorization>
    ),
  },
  {
    path: "/update-password",
    element: LoginSuspense(
      <Authorization>
        <SignInPage />
      </Authorization>
    ),
  },
  {
    path: "/forgot-login",
    element: LoginSuspense(
      <Authorization>
        <SignInPage />
      </Authorization>
    ),
  },
  {
    path: "/auth-card-redirect",
    element: withSuspense(
      <Authorization>
        <CardSuccess isOneTimePayment={true} successPage={true} />
      </Authorization>
    ),
  },
  {
    path: "/register-success-:alias",
    element:
      withSuspense(<RegisterSuccess />),


    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:logincompany/",
    element: LoginSuspense(
      <Authorization>
        <SignInPage />
      </Authorization>
    ),
    errorElement: <RouteErrorBoundary />,
  },


  {
    path: "/:company/confirm-information",
    element: LoginSuspense(<ConfirmInformation />),
  },
  {
    path: "/",
    element: <Navigate to="/intuityfe/dashboard" replace />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "card-redirect",
    element: withSuspense(<CardSuccess />),
  },
  {
    path: "/:company",
    element: LoginSuspense(<CompanyRouteGuard />),
    errorElement: <RouteErrorBoundary />,

    children: [
      {
        path: "dashboard",
        element: <DashboardLayoutWithSuspense />,
        children: [
          {
            index: true,
            element: withSuspense(
              <ProtectedRoute title="Overview">
                <DashBoardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "last-bill",
            element: withSuspense(
              <ProtectedRoute title="Last Bill">
                <LastBillPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "pay-now",
            element: <Navigate to="../last-bill" relative="path" replace />,
          },
          {
            path: "usage-alerts",
            element: withSuspense(
              <ProtectedRoute title="Usage Alerts">
                <CustomerServiceGuard tabKey="usageHistory">
                  <AlertsScreen />
                </CustomerServiceGuard>
              </ProtectedRoute>
            ),
          },
          {
            path: "notification-settings",
            element: withSuspense(
              <ProtectedRoute title="Notification Settings">
                <NotificationSettingsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "auto-pay",
            element: withSuspense(
              <ProtectedRoute title="AutoPay">
                <AutoPayPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "paperless",
            element: withSuspense(
              <ProtectedRoute title="Paperless Billing">
                <PaperLessPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "payment-methods",
            element: withSuspense(
              <ProtectedRoute title="Payments">
                <PaymentMethodsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "prior-bills",
            element: withSuspense(
              <ProtectedRoute title="Billing & Payments History">
                <PriorBillsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "usage-history",
            element: withSuspense(
              <ProtectedRoute title="Usage History">
                <CustomerServiceGuard tabKey="usageHistory">
                  <UsageHistoryPage />
                </CustomerServiceGuard>
              </ProtectedRoute>
            ),
          },
          {
            path: "service",
            element: withSuspense(
              <ProtectedRoute title="Contact Customer Service">
                <CustomerServiceGuard tabKey="service">
                  <CustomerServicePage />
                </CustomerServiceGuard>
              </ProtectedRoute>
            ),
          },
          {
            path: "settings",
            element: withSuspense(
              <ProtectedRoute title="Settings">
                <SettingsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "account",
            element: withSuspense(
              <ProtectedRoute title="Update Your Account Information">
                <CustomerServiceGuard tabKey="account">
                  <AccountPage />
                </CustomerServiceGuard>
              </ProtectedRoute>
            ),
          },
          {
            path: "stop-service",
            element: withSuspense(
              <ProtectedRoute title="Stop | Transfer Service">
                <CustomerServiceGuard tabKey="stopService">
                  <StopTransferServicePage />
                </CustomerServiceGuard>
              </ProtectedRoute>
            ),
          },
          {
            path: "link-account",
            element: withSuspense(
              <ProtectedRoute title="Link Accounts">
                <LinkAccountPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "invoice-details",
            element: withSuspense(
              <ProtectedRoute title="Invoice Details">
                <InvoiceDetailsPage />
              </ProtectedRoute>
            ),
          },
          // {
          //   path: "payment-details",
          //   element: withSuspense(
          //     <ProtectedRoute title="Payment Details">
          //       <PaymentDetailsPage />
          //     </ProtectedRoute>
          //   ),
          // },
          {
            path: "payment-details/:id",
            element: withSuspense(
              <ProtectedRoute title="Payment Details">
                <PaymentDetailsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "card-redirect",
            element: withSuspense(
              <ProtectedRoute title="Card Redirect">
                <CardSuccess />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: withSuspense(<NotFound />),
  },
]);
