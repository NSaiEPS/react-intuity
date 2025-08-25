import * as React from "react";
// import Grid from "@mui/material/Unstable_Grid2";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";

import { Budget } from "@/components/dashboard/overview/budget";

import { DashboardInfo } from "@/components/dashboard/overview/dashboard-info";
// import { Sales } from "@/components/dashboard/overview/sales";

import { TotalProfit } from "@/components/dashboard/overview/total-profit";
import { ScheduleRecurringBox } from "@/components/dashboard/overview/schedule-recurring-box";

const Sales = React.lazy(() =>
  import("@/components/dashboard/overview/sales").then((module) => ({
    default: module.Sales,
  }))
);

export default function DashBoardPage(): React.JSX.Element {
  const theme = useTheme();
  const isLargeUp = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Grid
      container
      spacing={2}
      sx={{
        maxWidth: "1600px",
        // margin: "0 auto",
      }}
    >
      {/* First Row (Budget + BillDue + AutoPay) */}
      <Grid item xs={12} lg={9}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Budget diff={12} trend="up" sx={{ height: "100%" }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TotalProfit value="BillDue" sx={{ height: "100%" }} />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sm={6} md={6} lg={3}>
        <DashboardInfo
          sx={{ height: "100%" }}
          type="autoPay"
          typeofUser="customer"
          value="autopay"
          isActive
        />
      </Grid>

      {/* Paperless card for small screens */}
      {!isLargeUp && (
        <Grid item xs={12} sm={6} md={6}>
          <DashboardInfo
            sx={{ height: "100%" }}
            value="paperless"
            typeofUser="customer"
            type="paperLess"
          />
        </Grid>
      )}

      {/* Sales Chart with optional ScheduleRecurringBox */}
      <Grid item xs={12} lg={9} order={{ xs: 3, lg: 1 }}>
        <Box display="flex" flexDirection="column" height="100%">
          <Box>
            <ScheduleRecurringBox />
          </Box>

          <React.Suspense fallback={<>Loading...</>}>
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
              sx={{ flexGrow: 1 }}
              dashboard
            />
          </React.Suspense>
        </Box>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} lg={3} order={{ xs: 2, lg: 2 }}>
        <Grid container spacing={2} height="-webkit-fill-available">
          {isLargeUp && (
            <Grid item xs={12}>
              <DashboardInfo
                sx={{ height: "100%" }}
                value="paperless"
                typeofUser="customer"
                type="paperLess"
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={6} lg={12}>
            <DashboardInfo
              sx={{ height: "100%" }}
              typeofUser="customer"
              value="notification_reminder"
              type="notification"
              apiCall
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6} lg={12}>
            <TotalProfit value="CustomerService" sx={{ height: "100%" }} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>

    //  <Grid container spacing={2}>
    //       {/* Left Column (75%) */}
    //       <Grid container spacing={2} xs={12} lg={8} xl={8}>
    //         <Grid xs={12} sm={6} lg={6} xl={6}>
    //           <Budget diff={12} trend="up" sx={{ height: "100%" }} />
    //         </Grid>
    //         <Grid xs={12} sm={6} lg={6} xl={6}>
    //           <TotalProfit value="BillDue" sx={{ height: "100%" }} />
    //         </Grid>
    //       </Grid>

    //       {/* Right Column (25%) */}
    //       {/* <Grid
    //         sm={6}
    //         xs={6}
    //         md={6}
    //         lg={3}
    //         sx={{ backgroundColor: "red", width: "100%" }}
    //       > */}

    //       {/* <Grid lg={3} sm={6} xs={12}> */}
    //       <Grid xs={12} sm={6} md={6} lg={3}>
    //         <DashboardInfo
    //           sx={{ height: "100%" }}
    //           type="autoPay"
    //           typeofUser="customer"
    //           value="autopay"
    //           isActive={true}
    //         />
    //       </Grid>

    //       {/* Paperless card for small screens */}
    //       {!isLargeUp && (
    //         <Grid xs={12} sm={6} md={6} lg={12} xl={12}>
    //           <DashboardInfo
    //             sx={{ height: "100%" }}
    //             value="paperless"
    //             typeofUser="customer"
    //             type="paperLess"
    //           />
    //         </Grid>
    //       )}

    //       {/* Sales Chart */}
    //       <Grid xs={12} lg={8} xl={8} order={{ xs: 3, lg: 1 }}>
    //         <React.Suspense fallback={<>Loading...</>}>
    //           <Sales
    //             chartSeries={[
    //               {
    //                 name: "This year",
    //                 data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20],
    //               },
    //               {
    //                 name: "Last year",
    //                 data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13],
    //               },
    //             ]}
    //             sx={{ height: "100%" }}
    //             dashboard
    //           />
    //         </React.Suspense>
    //       </Grid>

    //       {/* Right Side Column Extra Content */}
    //       <Grid
    //         container
    //         spacing={2}
    //         xs={12}
    //         md={12}
    //         lg={4}
    //         xl={4}
    //         order={{ xs: 2, lg: 2 }}
    //       >
    //         {isLargeUp && (
    //           <Grid xs={12} sm={6} md={6} lg={12} xl={12}>
    //             <DashboardInfo
    //               sx={{ height: "100%" }}
    //               value="paperless"
    //               typeofUser="customer"
    //               type="paperLess"
    //             />
    //           </Grid>
    //         )}
    //         <Grid xs={12} sm={6} md={6} lg={12} xl={12}>
    //           <DashboardInfo
    //             sx={{ height: "100%" }}
    //             typeofUser="customer"
    //             value="notification_reminder"
    //             type="notification"
    //             apiCall
    //           />
    //         </Grid>
    //         <Grid xs={12} sm={6} md={6} lg={12} xl={12}>
    //           <TotalProfit value="CustomerService" sx={{ height: "100%" }} />
    //         </Grid>
    //       </Grid>
    //     </Grid>
  );
}
