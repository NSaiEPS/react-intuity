import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { useMediaQuery, useTheme } from "@mui/material";

import { Budget } from "@/components/dashboard/overview/budget";

import { DashboardInfo } from "@/components/dashboard/overview/dashboard-info";
import { Sales } from "@/components/dashboard/overview/sales";
import { TotalProfit } from "@/components/dashboard/overview/total-profit";

export default function DashBoardPage(): React.JSX.Element {
  const theme = useTheme();
  const isLargeUp = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Grid container spacing={2}>
      {/* First Row */}
      <Grid container spacing={2} lg={9} xs={12}>
        <Grid lg={6} sm={6} xs={12}>
          <Budget diff={12} trend="up" sx={{ height: "100%" }} />
        </Grid>
        <Grid lg={6} sm={6} xs={12}>
          <TotalProfit value="BillDue" sx={{ height: "100%" }} />
        </Grid>
      </Grid>

      <Grid lg={3} sm={6} xs={12}>
        <DashboardInfo
          sx={{ height: "100%" }}
          type="autoPay"
          typeofUser="customer"
          value="autopay"
          isActive={true}
        />
      </Grid>

      {/* Paperless card for small screens */}
      {!isLargeUp && (
        <Grid xs={12} sm={6} md={6} lg={12}>
          <DashboardInfo
            sx={{ height: "100%" }}
            value="paperless"
            typeofUser="customer"
            type="paperLess"
          />
        </Grid>
      )}

      {/* Sales Chart */}
      <Grid lg={9} xs={12} order={{ xs: 3, lg: 1 }}>
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
          dashboard
        />
      </Grid>

      {/* Right Column */}
      <Grid
        container
        spacing={2}
        lg={3}
        md={12}
        xs={12}
        order={{ xs: 2, lg: 2 }}
      >
        {isLargeUp && (
          <Grid xs={12} sm={6} md={6} lg={12}>
            <DashboardInfo
              sx={{ height: "100%" }}
              value="paperless"
              typeofUser="customer"
              type="paperLess"
            />
          </Grid>
        )}
        <Grid xs={12} sm={6} md={6} lg={12}>
          <DashboardInfo
            sx={{ height: "100%" }}
            typeofUser="customer"
            value="notification_reminder"
            type="notification"
            apiCall
          />
        </Grid>
        <Grid xs={12} sm={6} md={6} lg={12}>
          <TotalProfit value="CustomerService" sx={{ height: "100%" }} />
        </Grid>
      </Grid>
    </Grid>
  );
}
