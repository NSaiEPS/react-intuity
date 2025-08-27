import { createBrowserRouter, Navigate } from "react-router-dom";
import React from "react";

// Wrappers (keep them eager — they’re small and used everywhere)
import ProtectedRoute, {
  Authorization,
  DashboardLayoutWithSuspense,
  LoginSuspense,
} from "./components/core/protectedRoute";
import CompanyRouteGuard from "./components/core/company-routeGuard";

// Lazy imports for all pages
const SignInPage = React.lazy(() =>
  import("./components/auth/sign-in-page").then((m) => ({
    default: m.SignInPage,
  }))
);
const ConfirmInformation = React.lazy(
  () => import("./pages/auth/confirm-information/page")
);
const DashBoardPage = React.lazy(() => import("./pages/dashboard/page"));
const PayNowPage = React.lazy(() => import("./pages/dashboard/pay-now/page"));
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

const LoaderFallback = React.lazy(() =>
  import("@/components/core/protectedRoute").then((module) => ({
    default: module.LoaderFallback,
  }))
);
// Suspense wrapper to avoid repeating
// const withSuspense = (element: React.ReactNode) => (
//   <React.Suspense fallback={<LoaderFallback />}>{element}</React.Suspense>
// );

const withSuspense = (element: React.ReactNode) => {
  return (
    <React.Suspense fallback={<LoaderFallback />}>
      {<>{element}</>}
    </React.Suspense>
  );
};
console.log("1.0.0", "version");
export const router = createBrowserRouter([
  {
    path: "/login",
    element: LoginSuspense(
      <Authorization>
        <SignInPage title={"Login"} />
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
        <SignInPage title={"Sign Up"} />
      </Authorization>
    ),
  },
  {
    path: "/reset-password",
    element: LoginSuspense(
      <Authorization>
        <SignInPage title={"Recover Password"} />
      </Authorization>
    ),
  },
  {
    path: "/:logincompany/",
    element: LoginSuspense(
      <Authorization>
        <SignInPage title={"Login"} />
      </Authorization>
    ),
  },
  {
    path: "/:company/confirm-information",
    element: LoginSuspense(<ConfirmInformation />),
  },
  {
    path: "/",
    element: <Navigate to="/intuityfe/dashboard" replace />,
  },
  {
    path: "/:company",
    element: LoginSuspense(<CompanyRouteGuard />),
    children: [
      {
        path: "dashboard",
        element: <DashboardLayoutWithSuspense />,
        children: [
          {
            index: true,
            element: withSuspense(
              <ProtectedRoute title="Homepage">
                <DashBoardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "pay-now",
            element: withSuspense(
              <ProtectedRoute title="Billing">
                <PayNowPage />
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
              <ProtectedRoute title="Auto Pay">
                <AutoPayPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "paperless",
            element: withSuspense(
              <ProtectedRoute title="Paper Less">
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
              <ProtectedRoute title="Billing">
                <PriorBillsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "usage-history",
            element: withSuspense(
              <ProtectedRoute title="Usage">
                <UsageHistoryPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "service",
            element: withSuspense(
              <ProtectedRoute title="Customer">
                <CustomerServicePage />
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
              <ProtectedRoute title="Account">
                <AccountPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "stop-service",
            element: withSuspense(
              <ProtectedRoute title="Stop | Transfer">
                <StopTransferServicePage />
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
          {
            path: "payment-details",
            element: withSuspense(
              <ProtectedRoute title="Payment Details">
                <PaymentDetailsPage />
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
