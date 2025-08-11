// CompanyRouteGuard.tsx
import React from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

export default function CompanyRouteGuard() {
  console.log("CompanyRouteGuard rendered");
  // Get the company from the URL params
  const { company } = useParams();
  const storedCompanyId = secureLocalStorage.getItem("intuity-companyId");

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
