import * as React from "react";
import {
  getConfirmInfo,
  getUserInfoByToken,
} from "@/state/features/accountSlice";
import { getLocalStorage } from "@/utils/auth";
import { decryptFromPHP } from "@/utils/decryptHelper";
import { Box, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router";

import { ConfirmInfoDetails } from "@/components/auth/confirm-info";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";

export default function ConfirmInformation() {
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
    document.title = "Confirm Info - Intuity";
    setContextLoading(true);
  }, []);
  const raw = getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  React.useEffect(() => {
    //   const role_id = stored?.body?.acl_role_id;
    //   const user_id = stored?.body?.customer_id;
    //   const token = stored?.body?.token;
    //   const formData = new FormData();
    // const params = new URLSearchParams(search);

    // const token = params.get("token");
    // const aclRoleId = params.get("acl_role_id");
    // const customerId = params.get("customer_id");
    //   formData.append("acl_role_id", "4");
    //   formData.append("customer_id", "810");

    //   dispatch(
    //     getConfirmInfo(
    //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0NjksImV4cCI6MTc2MjI2MzI2N30=.jMKhTD0/C5Mh6VLFs8hCzzcyIJgDSn3ZGzXk6/uoAwQ=",
    //       formData,
    //       undefined,
    //       setContextLoading
    //     )
    //   );

    if (search) {
      //console.log(search, "fromsearch");
      const formData = new FormData();
      const params = new URLSearchParams(search);

      const aclRoleId = params.get("acl_role_id");
      const customerId = params.get("customer_id");
      formData.append("acl_role_id", aclRoleId);
      formData.append("customer_id", customerId);
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
      const token = stored?.body?.token;
      const formData = new FormData();

      formData.append("acl_role_id", role_id);
      formData.append("customer_id", user_id);
      dispatch(getConfirmInfo(token, formData, undefined, setContextLoading));
    }
  }, [search]);
  const getUserDetailsSuccess = () => {
    const formData = new FormData();
    const params = new URLSearchParams(search);

    const aclRoleId = params.get("acl_role_id");
    const customerId = params.get("customer_id");
    formData.append("acl_role_id", aclRoleId);
    formData.append("customer_id", customerId);
    const token = decrypted;
    dispatch(getConfirmInfo(token, formData, undefined, setContextLoading));
  };
  return (
    <Box
      p={4}
      sx={{
        px: { xs: 2, sm: 4, md: 8, lg: 20 },
      }}
    >
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
