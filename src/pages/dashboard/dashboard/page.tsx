import * as React from "react";

import dynamic from "next/dynamic";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

//import { companySlugs, config } from "@/config";
// import GaugeChart from '@/components/dashboard/overview/billing-needle-chart';
import { Budget } from "@/components/dashboard/overview/budget";
import { DashboardInfo } from "@/components/dashboard/overview/dashboard-info";
import { IconCards } from "@/components/dashboard/overview/Icon-cards";
import { Sales } from "@/components/dashboard/overview/sales";
import { TotalProfit } from "@/components/dashboard/overview/total-profit";

const GaugeChart = dynamic(
  () => import("@/components/dashboard/overview/billing-needle-chart"),
  { ssr: false }
);

// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }//export const metadata = {
//   title: `Homepage - ${config.site.name}`,
// } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={2}>
      <Grid lg={12} xs={12}>
        <Budget userInfo={true} icons={true} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Budget diff={12} trend="up" sx={{ height: "100%" }} value="$84.00" />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <DashboardInfo
          sx={{ height: "100%" }}
          type="autoPay"
          typeofUser={"customer"}
          value={"autopay"}
          isActive={true}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <DashboardInfo
          sx={{ height: "100%" }}
          value={"paperless"}
          typeofUser={"customer"}
          type="paperLess"
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <DashboardInfo
          sx={{ height: "100%" }}
          typeofUser={"customer"}
          value={"notification_reminder"}
          type="notification"
          apiCall={true}
        />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <TotalProfit sx={{ height: "100%" }} value="BillDue" />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <TotalProfit sx={{ height: "100%" }} value="DaysRemaining" />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <GaugeChart sx={{ height: "100%" }} />
      </Grid>

      <Grid lg={12} xs={12}>
        <Sales
          chartSeries={[
            {
              name: "This year",
              data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20],
            },
            {
              name: "Last year",
              data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13],
            },
          ]}
          sx={{ height: "100%" }}
          dashboard={true}
        />
      </Grid>

      {/* <Grid lg={3} md={6} xs={12}>
        <Grid lg={6} sm={6} md={12} xs={12}>
          <TotalProfit sx={{ height: '200%' }} value="BillDue" />
        </Grid>
        <Grid lg={6} sm={6} md={12} xs={12}>
          <TotalProfit sx={{ height: '100%', mt: 2 }} value="DaysRemaining" />
        </Grid>
        <Grid mt={2}>
          <GaugeChart />

          <Stack direction="row" spacing={2}>
            <IconCards type={'Headphones'} />
            <IconCards type={'Envelope'} />
          </Stack>
        </Grid>
      </Grid> */}
    </Grid>
  );
}
