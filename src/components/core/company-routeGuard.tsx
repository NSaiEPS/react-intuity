// CompanyRouteGuard.tsx
import { getLocalStorage } from "@/utils/auth";
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

export default function CompanyRouteGuard() {
  const user = getLocalStorage("intuity-user");
  const storedCompanyId = secureLocalStorage.getItem("intuity-companyId");

  const { company } = useParams();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!storedCompanyId) {
    return <Navigate to="/" replace />;
  }

  if (company !== storedCompanyId) {
    return <Navigate to={`/${storedCompanyId}/dashboard`} replace />;
  }

  return <Outlet />;
}
