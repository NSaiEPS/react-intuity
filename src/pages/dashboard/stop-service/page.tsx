import * as React from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";

//import { companySlugs, config } from "@/config";
import { SendBillDetailsForm } from "@/components/dashboard/account/send-bill-details";
import { TransferDetailsForm } from "@/components/dashboard/account/transfer-details";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import { useLoading } from "@/components/core/skeletion-context";
import { getLocalStorage } from "@/utils/auth";
import { stopTransferService } from "@/state/features/accountSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";

//export const metadata = {
//   title: `Stop | Transfer - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function StopTransferServicePage(): React.JSX.Element {
  const { setContextLoading } = useLoading();
  const dispatch = useDispatch();

  const userInfo = useSelector((state: RootState) => state.Account.userInfo);
  React.useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  const getUserDetails = () => {
    type IntuityUser = {
      body?: {
        acl_role_id?: string;
        customer_id?: string;
        token?: string;
      };
    };
    const raw = getLocalStorage("intuity-user");

    const stored: IntuityUser | null =
      typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
    console.log(stored, "stored");
    // let roleId = stored?.user?.body?.acl_role_id;
    // let userId = stored?.user?.body?.id;

    const roleId = stored?.body?.acl_role_id;
    const customer_id = stored?.body?.customer_id;
    // let userId = stored?.body?.id;
    const token = stored?.body?.token;

    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", customer_id);
    formData.append("is_form", "0");
    dispatch(
      stopTransferService(token, formData, true, undefined, setContextLoading)
    );
  };
  React.useEffect(() => {
    getUserDetails();
  }, [userInfo]);
  return (
    <SkeletonWrapper>
      <Stack spacing={3}>
        <div>
          <Typography variant="h4"> Stop/Transfer Service</Typography>
        </div>
        <Grid container spacing={3}>
          <Grid lg={12} md={12} xs={12}>
            <TransferDetailsForm />
            <SendBillDetailsForm />
          </Grid>
        </Grid>
      </Stack>
    </SkeletonWrapper>
  );
}
