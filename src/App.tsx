import { createBrowserRouter, Navigate } from "react-router-dom";

import { getLocalStorage } from "./utils/auth";
import { SignInPage } from "./components/auth/sign-in-page";
import DashboardLayout from "./pages/dashboard/layout";
import ConfirmInformation from "./pages/auth/confirm-information/page";
// import { getLoggedInUserType, getToken, USERS } from "../utils";

const ProtectedRoute = ({ element }) =>
  getLocalStorage("intuity-user") ? element : <Navigate to="/login" />;

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
    path: "/login-:company",
    element: <Authorization element={<SignInPage />} />,
  },

  {
    path: "/:company/confirm-information",
    element: <ConfirmInformation />,
  },
  {
    path: "/:company",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        // element: <ProtectedRoute element={<SignInPage />} />,
        element: <SignInPage />,
      },
    ],
  },
]);
