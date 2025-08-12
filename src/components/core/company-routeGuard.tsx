// CompanyRouteGuard.tsx
import { getLocalStorage } from "@/utils/auth";
import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

export default function CompanyRouteGuard() {
  console.log("CompanyRouteGuard rendered");
  const user = getLocalStorage("intuity-user");
  const storedCompanyId = secureLocalStorage.getItem("intuity-companyId");

  const { company } = useParams();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Get the company from the URL params

  if (!storedCompanyId) {
    // If there's no stored company, maybe force logout or handle gracefully
    return <Navigate to="/" replace />;
  }

  if (company !== storedCompanyId) {
    return <Navigate to={`/${storedCompanyId}/dashboard`} replace />;
  }

  // ✅ Company matches, so allow rendering child routes
  return <Outlet />;
}
