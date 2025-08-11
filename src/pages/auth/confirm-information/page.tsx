import * as React from "react";

import { Box, Typography } from "@mui/material";
import { ConfirmInfoDetails } from "@/components/auth/confirm-info";
import { getLocalStorage } from "@/utils/auth";
import { useDispatch } from "react-redux";
import { getConfirmInfo } from "@/state/features/accountSlice";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import { Helmet } from "react-helmet";

// import { ConfirmInfoDetails } from '@/components/auth/confirm-info';

// ✅ This line disables static export for this page

// ✅ Lazy load ConfirmInfoDetails

export default function ConfirmInformation() {
  const { setContextLoading } = useLoading();

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const dispatch = useDispatch();
  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  const raw = getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  React.useEffect(() => {
    const role_id = stored?.body?.acl_role_id;
    const user_id = stored?.body?.customer_id;
    const token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", role_id);
    formData.append("customer_id", user_id);
    dispatch(getConfirmInfo(token, formData, undefined, setContextLoading));
  }, []);
  return (
    <Box
      p={4}
      sx={{
        px: { xs: 2, sm: 4, md: 8, lg: 20 },
      }}
    >
      <Helmet>
        <title>{`Confirm Info - Intuity`}</title>
      </Helmet>
      <SkeletonWrapper>
        <ConfirmInfoDetails />
      </SkeletonWrapper>

      <Typography
        variant="body2"
        color="text.secondary"
        mt={6}
        fontWeight="bold"
        textAlign="center"
      >
        This is a fee-based service. A convenience fee will be applied to all
        credit card and electronic check transactions.
      </Typography>
    </Box>
  );
}
