// CompanyRouteGuard.tsx
import React, { useEffect } from "react";
import { fetchSideNavPermissions } from "@/state/features/sideNavSlice";
import { getLocalStorage } from "@/utils/auth";
import { useDispatch } from "@/hooks/redux";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import { useUser } from "@/hooks/use-user";
import { LoginSkeleton } from "./protectedRoute";
import { Box, Typography } from "@mui/material";

export default function CompanyRouteGuard() {
  const { user, auth, isLoading, isServiceUnavailable, retrySession } = useUser();

  const storedCompanyId = secureLocalStorage.getItem("intuity-companyId");
  interface AliasUser {
    alias: string;
  }
  const aliasUser: AliasUser | null = getLocalStorage("alias-details") as AliasUser | null;
  const dispatch = useDispatch();

  const { company } = useParams();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchSideNavPermissions());
  }, [pathname, dispatch]);

  if (isLoading) {
    return <LoginSkeleton />;
  }

  if (isServiceUnavailable) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", p: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={600} mb={1}>
          Service Temporarily Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          We are temporarily unable to validate your session. Please retry.
        </Typography>
        <button
          onClick={() => retrySession?.()}
          style={{ padding: "8px 20px", backgroundColor: "#1976d2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Retry
        </button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={aliasUser ? `/login-${aliasUser?.alias}` : `/login`}
        replace
      />
    );
  }

  const targetCompany = company || (storedCompanyId as string) || aliasUser?.alias || "intuityfe";

  if (auth?.must_complete_two_fa) {
    return (
      <Navigate
        to={`/${targetCompany}/confirm-information`}
        replace
        state={{ two_fa_status: false }}
      />
    );
  }

  if (auth?.must_confirm_information) {
    return (
      <Navigate
        to={`/${targetCompany}/confirm-information`}
        replace
        state={{ two_fa_status: true }}
      />
    );
  }

  if (!storedCompanyId) {
    return <Navigate to="/" replace />;
  }

  if (company !== storedCompanyId) {
    return <Navigate to={`/${storedCompanyId}/dashboard`} replace />;
  }

  return <Outlet />;
}
