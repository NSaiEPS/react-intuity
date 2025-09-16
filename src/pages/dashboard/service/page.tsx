import * as React from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";

//import { companySlugs, config } from "@/config";
import { CustomerDetailsForm } from "@/components/dashboard/service/customer-service";
import { Card, CardHeader, Grid as MUIGrid } from "@mui/material";
import { boarderRadius } from "@/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";

//export const metadata = {
//   title: `Customer - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function CustomerServicePage(): React.JSX.Element {
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
      <MUIGrid container spacing={2} justifyContent="space-between">
        {/* <Typography variant="h5" m={4} mt={6} ml={5}>
          Contact Customer Service
        </Typography> */}
        <CardHeader
          title={
            <Typography ml={1} variant="h5">
              Contact Customer Service
            </Typography>
          }
        />

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
      <Grid container spacing={3}>
        <Grid lg={12} md={12} xs={12}>
          <CustomerDetailsForm />
        </Grid>
      </Grid>
    </Card>
  );
}
