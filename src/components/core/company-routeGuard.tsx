// CompanyRouteGuard.tsx
import React, { useEffect } from "react";
import {
  getConfirmInfo,
  getUserInfoByToken,
} from "@/state/features/accountSlice";
import { getLocalStorage } from "@/utils/auth";
import { decryptFromPHP } from "@/utils/decryptHelper";
import { useDispatch } from "@/hooks/redux";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

import { useLoading } from "./skeletion-context";

export default function CompanyRouteGuard() {
  const user = getLocalStorage("intuity-user");
  const storedCompanyId = secureLocalStorage.getItem("intuity-companyId");
  interface AliasUser {
  alias: string;
}
  const aliasUser: AliasUser | null = getLocalStorage("alias-details") as AliasUser | null;
  const dispatch = useDispatch();
  const { setContextLoading } = useLoading();

  const { company } = useParams();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const { search } = useLocation();
  if (search.includes("token=")) {
    const token = () => {
      const match = search.match(/[?&]token=([^&]*)/);
      //console.log(search, match);
      if (!match) return null;
      // Preserve '+' (used in AES base64)
      const raw = match[1].replace(/\+/g, "%2B");
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    };

    const decrypted = () => {
      if (!token()) return null;
      try {
        // return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0NjksImV4cCI6MTc2Mjg3NDYxN30=.cWyvBciB5ggrRwjQ/9PbKFxZL0JIIRH8yG/5iKMZY/A=";
        return decryptFromPHP(token());
      } catch (err) {
        console.error("Decryption error:", err);
        return null;
      }
    };
    const getUserDetailsSuccess = () => {
      const formData = new FormData();
      const params = new URLSearchParams(search);

      const aclRoleId = params.get("acl_role_id");
      const customerId = params.get("customer_id");
      formData.append("acl_role_id", aclRoleId);
      formData.append("customer_id", customerId);
      const token = decrypted();
      dispatch(getConfirmInfo(token, formData, undefined, setContextLoading));
    };
    if (search) {
      //console.log(search, "fromsearch");
      const formData = new FormData();
      const params = new URLSearchParams(search);

      const aclRoleId = params.get("acl_role_id");
      const customerId = params.get("customer_id");
      formData.append("acl_role_id", aclRoleId);
      formData.append("customer_id", customerId);
      const token = decrypted();
      dispatch(
        getUserInfoByToken(
          token,
          formData,
          getUserDetailsSuccess,
          setContextLoading
        )
      );
    }

    return <Outlet />;
  }

  if (!user) {
    return (
      <Navigate
        to={aliasUser ? `/login-${aliasUser?.alias}` : `/login`}
        replace
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
