import * as React from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

//import { companySlugs, config } from "@/config";
import { AccountSettingsForm } from "@/components/dashboard/settings/account-settings";
import { Notifications } from "@/components/dashboard/settings/notifications";
import { UpdatePasswordForm } from "@/components/dashboard/settings/update-password-form";

import { Card, CardHeader, Grid as MUIGrid } from "@mui/material";

import { boarderRadius } from "@/utils";
import { RootState } from "@/state/store";
import { useSelector } from "react-redux";
import { getLocalStorage } from "@/utils/auth";

// //export const metadata = {
//   title: `Settings  - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function SettingsPage(): React.JSX.Element {
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const CustomerInfo: any = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      {/* <div>
        <Typography variant="h5" m={2}>
          Update Login and Password
        </Typography>
      </div> */}

      <MUIGrid container spacing={2} justifyContent="space-between">
        <Typography variant="h5" m={4} mt={6} ml={5}>
          Update Login and Password
        </Typography>

        <CardHeader
          subheader={
            <Typography variant="h6">
              Name :{CustomerInfo?.customer_name}
            </Typography>
          }
          title={
            <Typography variant="h6">
              Account No :{CustomerInfo?.acctnum}
            </Typography>
          }
        />
      </MUIGrid>
      {/* no need as of now */}
      {/* <Notifications /> */}
      <AccountSettingsForm />
      <UpdatePasswordForm />
    </Card>
  );
}
