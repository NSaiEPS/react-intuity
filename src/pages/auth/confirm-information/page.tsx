import * as React from "react";
import {
  getConfirmInfo,
  getUserInfoByToken,
} from "@/state/features/accountSlice";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { decryptFromPHP } from "@/utils/decryptHelper";
import { Box } from "@mui/material";
import { useDispatch } from "@/hooks/redux";
import { useLocation, useParams } from "react-router";

import { ConfirmInfoDetails } from "@/components/auth/confirm-info";
import { useLoading } from "@/components/core/skeleton-context";
import { ConfirmInfoSkeleton } from "@/components/dashboard/skeletons";

export default function ConfirmInformation() {
  const { company } = useParams();
  const { search } = useLocation();

  // ✅ Extract token safely
  const token = React.useMemo(() => {
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
  }, [search]);
  //console.log(token);
  // ✅ Decrypt token using your PHP-compatible function
  const decrypted = React.useMemo(() => {
    if (!token) return null;
    try {
      return decryptFromPHP(token);
    } catch (err) {
      console.error("Decryption error:", err);
      return null;
    }
  }, [token]);

  const { contextLoading, setContextLoading } = useLoading();

  const dispatch = useDispatch();
  React.useLayoutEffect(() => {
    document.title = "Confirm Info";
    setContextLoading(true);
  }, []);
  const raw = getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  React.useEffect(() => {
    if (search) {
      //console.log(search, "fromsearch");
      const formData = new FormData();
      const params = new URLSearchParams(search);

      const aclRoleId = params.get("acl_role_id");
      const customerId = params.get("customer_id");
      if (aclRoleId) formData.append("acl_role_id", aclRoleId);
      if (customerId) formData.append("customer_id", customerId);

      const queryAlias = params.get("company_alias") || params.get("alias") || params.get("company");
      const isCompanySpecific = (company && company !== "intuityfe") || Boolean(queryAlias);
      const effectiveCompanyAlias = isCompanySpecific
        ? ((company && company !== "intuityfe" ? company : queryAlias) || "").trim()
        : undefined;

      if (effectiveCompanyAlias) {
        formData.append("company_alias", effectiveCompanyAlias);
      }

      const token = decrypted;
      dispatch(
        getUserInfoByToken(
          token,
          formData,
          getUserDetailsSuccess,
          setContextLoading
        )
      );
    } else {
      const role_id = stored?.body?.acl_role_id;
      const user_id = stored?.body?.customer_id;
      const formData = new FormData();

      if (role_id) formData.append("acl_role_id", role_id);
      if (user_id) formData.append("customer_id", user_id);
      dispatch(getConfirmInfo(formData, undefined, setContextLoading));
    }
  }, [search, company]);

  const getUserDetailsSuccess = () => {
    const formData = new FormData();
    const params = new URLSearchParams(search);

    const aclRoleId = params.get("acl_role_id");
    const customerId = params.get("customer_id");
    if (aclRoleId) formData.append("acl_role_id", aclRoleId);
    if (customerId) formData.append("customer_id", customerId);

    const queryAlias = params.get("company_alias") || params.get("alias") || params.get("company");
    const isCompanySpecific = (company && company !== "intuityfe") || Boolean(queryAlias);
    const effectiveCompanyAlias = isCompanySpecific
      ? ((company && company !== "intuityfe" ? company : queryAlias) || "").trim()
      : undefined;

    if (effectiveCompanyAlias) {
      formData.append("company_alias", effectiveCompanyAlias);
    }

    dispatch(getConfirmInfo(formData, undefined, setContextLoading));
  };
  return (
    <Box
      p={4}
      sx={{
        px: { xs: 2, sm: 4, md: 8, lg: 20 },
      }}
    >
      {contextLoading ? <ConfirmInfoSkeleton /> : <ConfirmInfoDetails />}

      {/* <Typography
        variant="body2"
        color="text.secondary"
        mt={6}
        fontWeight="bold"
        textAlign="center"
      >
        This is a fee-based service. A convenience fee will be applied to all
        credit card and electronic check transactions.
      </Typography> */}
    </Box>
  );
}
