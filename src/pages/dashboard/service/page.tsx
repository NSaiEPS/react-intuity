import * as React from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";

//import { companySlugs, config } from "@/config";
import { CustomerDetailsForm } from "@/components/dashboard/service/customer-service";
import { Card, CardHeader, Grid as MUIGrid } from "@mui/material";
import { boarderRadius, CustomerInfo } from "@/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage } from "@/utils/auth";
import Header from "@/components/CommonComponents/Header";

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

  const CustomerInfo: CustomerInfo = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage("intuity-customerInfo");
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      <Header title="Contact Customer Service" />
      <Grid container spacing={3}>
        <Grid lg={12} md={12} xs={12}>
          <CustomerDetailsForm />
        </Grid>
      </Grid>
    </Card>
  );
}
