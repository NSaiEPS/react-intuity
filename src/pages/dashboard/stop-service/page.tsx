import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { SendBillDetailsForm } from "@/components/dashboard/account/send-bill-details";
import { TransferDetailsForm } from "@/components/dashboard/account/transfer-details";
import { useLoading } from "@/components/core/skeleton-context";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { stopTransferService } from "@/state/features/accountSlice";
import { useDispatch, useSelector } from "@/hooks/redux";
import { RootState } from "@/state/store";
import { StopServiceSkeleton } from "@/components/dashboard/skeletons";
import { boarderRadius } from "@/utils";
import { Card } from "@mui/material";
import Header from '@/components/CommonComponents/Header';


export default function StopTransferServicePage(): React.JSX.Element {
  const { contextLoading, setContextLoading } = useLoading();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.Account.userInfo);

  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  React.useEffect(() => {
    const raw = getLocalStorage("intuity-user");
    const stored: IntuityUser | null =
      typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
    const formData = new FormData();
    formData.append("acl_role_id", stored?.body?.acl_role_id);
    formData.append("customer_id", stored?.body?.customer_id);
    formData.append("is_form", "0");
    dispatch(stopTransferService(formData, true, undefined, setContextLoading));
  }, [userInfo]);

  return (
    <>
      {contextLoading && <StopServiceSkeleton />}
      <Card sx={{ borderRadius: boarderRadius.card, display: contextLoading ? 'none' : 'block' }}>
        <Header title="Stop/Transfer Service" />
        <Grid container spacing={3}>
          <Grid lg={12} md={12} xs={12}>
            <TransferDetailsForm />
            <SendBillDetailsForm />
          </Grid>
        </Grid>
      </Card>
    </>
  );
}
