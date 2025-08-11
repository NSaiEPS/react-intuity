import * as React from "react";

import { RootState } from "@/state/store";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { useDispatch, useSelector } from "react-redux";

//import { companySlugs, config } from "@/config";
import { AccountDetailsForm } from "@/components/dashboard/account/account-details-form";
import { AccountInfo } from "@/components/dashboard/account/account-info";

import { getLocalStorage } from "@/utils/auth";
import { getAccountInfo } from "@/state/features/accountSlice";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import { useLoading } from "@/components/core/skeletion-context";

//export const metadata = {
//   title: `Account  - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function AccountPage(): React.JSX.Element {
  const dispatch = useDispatch();
  const { setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const userInfo = useSelector((state: RootState) => state?.Account.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const getUserDetails = () => {
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const token = stored?.body?.token;
    dispatch(getAccountInfo(roleId, userId, token, setContextLoading));
  };

  React.useEffect(() => {
    getUserDetails();
  }, [userInfo]);
  return (
    <SkeletonWrapper>
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Account</Typography>
        </div>
        <Grid container spacing={3}>
          <Grid lg={6} md={6} xs={12}>
            <AccountInfo />
          </Grid>
          <Grid lg={12} md={6} xs={12}>
            <AccountDetailsForm />
            {/* no need as of now */}
            {/* <NewDetailsForm /> */}
          </Grid>
        </Grid>
      </Stack>
    </SkeletonWrapper>
  );
}
