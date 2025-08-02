import { createBrowserRouter, Navigate } from "react-router-dom";

import { getLocalStorage } from "./utils/auth";
import { SignInPage } from "./components/auth/sign-in-page";
import DashboardLayout from "./pages/dashboard/layout";
import ConfirmInformation from "./pages/auth/confirm-information/page";
import DashBoardPage from "./pages/dashboard/page";
import ProtectedRoute from "./components/core/protectedRoute";
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
        path: "campaign", // ✅ relative path
        element: (
          <ProtectedRoute>
            <DashBoardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "auto-pay", // ✅ relative path
        element: (
          <ProtectedRoute>
            <ConfirmInformation />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
