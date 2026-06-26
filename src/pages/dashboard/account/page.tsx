import * as React from "react";
import { RootState } from "@/state/store";
import Grid from "@mui/material/Unstable_Grid2";
import { useDispatch, useSelector } from "@/hooks/redux";
import { AccountDetailsForm } from "@/components/dashboard/account/account-details-form";
import { AccountInfo } from "@/components/dashboard/account/account-info";
import { Card, Divider } from "@mui/material";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { getAccountInfo } from "@/state/features/accountSlice";
import { useLoading } from "@/components/core/skeleton-context";
import { AccountSkeleton } from "@/components/dashboard/skeletons";
import { boarderRadius } from "@/utils";
import Header from "@/components/CommonComponents/header";

export default function AccountPage(): React.JSX.Element {
  const dispatch = useDispatch();
  const { contextLoading, setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  const userInfo = useSelector((state: RootState) => state?.Account.userInfo);
  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  React.useEffect(() => {
    dispatch(getAccountInfo(stored?.body?.acl_role_id, stored?.body?.customer_id, setContextLoading));
  }, [userInfo]);

  return (
    <>
      {contextLoading && <AccountSkeleton />}
      <Card sx={{ borderRadius: boarderRadius.card, display: contextLoading ? 'none' : 'block' }}>
        <Header title="Account" />
        <Divider sx={{ borderColor: "rgba(0,0,0,0.08)", borderBottomWidth: 1 }} />
        <Grid container spacing={3} mt={2}>
          <Grid lg={6} md={6} xs={12}>
            <AccountInfo />
          </Grid>
          <Grid lg={12} md={6} xs={12}>
            <AccountDetailsForm />
          </Grid>
        </Grid>
      </Card>
    </>
  );
}
