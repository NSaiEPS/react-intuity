import * as React from "react";
import { getConfirmInfo } from "@/state/features/accountSlice";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { Box } from "@mui/material";
import { useDispatch } from "@/hooks/redux";
import { useLocation, useParams } from "react-router";

import { ConfirmInfoDetails } from "@/components/auth/confirm-info";
import { useLoading } from "@/components/core/skeleton-context";
import { ConfirmInfoSkeleton } from "@/components/dashboard/skeletons";

export default function ConfirmInformation() {
  const { company } = useParams();
  const { search } = useLocation();

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
    const formData = new FormData();
    const params = new URLSearchParams(search);

    const aclRoleId = params.get("acl_role_id") || stored?.body?.acl_role_id;
    const customerId = params.get("customer_id") || stored?.body?.customer_id;

    if (aclRoleId) formData.append("acl_role_id", String(aclRoleId));
    if (customerId) formData.append("customer_id", String(customerId));

    const queryAlias = params.get("company_alias") || params.get("alias") || params.get("company");
    const isCompanySpecific = (company && company !== "intuityfe") || Boolean(queryAlias);
    const effectiveCompanyAlias = isCompanySpecific
      ? ((company && company !== "intuityfe" ? company : queryAlias) || "").trim()
      : undefined;

    if (effectiveCompanyAlias) {
      formData.append("company_alias", effectiveCompanyAlias);
    }

    dispatch(getConfirmInfo(formData, undefined, setContextLoading));
  }, [search, company]);

  return (
    <Box
      p={4}
      sx={{
        px: { xs: 2, sm: 4, md: 8, lg: 20 },
      }}
    >
      {contextLoading ? <ConfirmInfoSkeleton /> : <ConfirmInfoDetails />}
    </Box>
  );
}
