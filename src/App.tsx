import { createBrowserRouter, Navigate } from "react-router-dom";

import { getLocalStorage } from "./utils/auth";
import { SignInPage } from "./components/auth/sign-in-page";
import DashboardLayout from "./pages/dashboard/layout";
import ConfirmInformation from "./pages/auth/confirm-information/page";
import DashBoardPage from "./pages/dashboard/page";
import ProtectedRoute from "./components/core/protectedRoute";
import PayNowPage from "./pages/dashboard/pay-now/page";
import NotificationSettingsPage from "./pages/dashboard/notification-settings/page";
import AutoPayPage from "./pages/dashboard/auto-pay/page";
import PaperLessPage from "./pages/dashboard/paperless/page";
import PaymentMethodsPage from "./pages/dashboard/payment-methods/page";
import PriorBillsPage from "./pages/dashboard/prior-bills/page";
import UsageHistoryPage from "./pages/dashboard/usage-history/page";
import CustomerServicePage from "./pages/dashboard/service/page";
import SettingsPage from "./pages/dashboard/settings/page";
import AccountPage from "./pages/dashboard/account/page";
import StopTransferServicePage from "./pages/dashboard/stop-service/page";
import LinkAccountPage from "./pages/dashboard/link-account/page";
import InvoiceDetailsPage from "./pages/dashboard/invoice-details/page";
// import { getLoggedInUserType, getToken, USERS } from "../utils";

const Authorization = ({ element }) =>
  getLocalStorage("intuity-user") ? <Navigate to="/" /> : element;

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Authorization element={<SignInPage />} />,
  },
  {
    path: "/sign-up",
    element: <Authorization element={<SignInPage />} />,
  },
  {
    path: "/reset-password",
    element: <Authorization element={<SignInPage />} />,
  },
  {
    // path: "/login-:company/",
    path: "/login-RiverPark-1/",

    element: <Authorization element={<SignInPage />} />,
  },

  {
    path: "/:company/confirm-information",
    element: <ConfirmInformation />,
  },
  {
    path: "/",
    element: <Navigate to="/intuityfe/dashboard" replace />,
  },
  {
    path: "/:company/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "pay-now",
        element: (
          <ProtectedRoute>
            <PayNowPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notification-settings",
        element: (
          <ProtectedRoute>
            <NotificationSettingsPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "auto-pay",
        element: (
          <ProtectedRoute>
            <AutoPayPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "paperless",
        element: (
          <ProtectedRoute>
            <PaperLessPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment-methods",
        element: (
          <ProtectedRoute>
            <PaymentMethodsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "prior-bills",
        element: (
          <ProtectedRoute>
            <PriorBillsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "usage-history",
        element: (
          <ProtectedRoute>
            <UsageHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "service",
        element: (
          <ProtectedRoute>
            <CustomerServicePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "account",
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "stop-service",
        element: (
          <ProtectedRoute>
            <StopTransferServicePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "link-account",
        element: (
          <ProtectedRoute>
            <LinkAccountPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "invoice-details",
        element: (
          <ProtectedRoute>
            <InvoiceDetailsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
