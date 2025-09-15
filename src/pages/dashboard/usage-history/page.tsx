import * as React from "react";

import { Box, Card, Grid } from "@mui/material";
import Stack from "@mui/material/Stack";

//import { companySlugs, config } from "@/config";
import BarChart from "@/components/dashboard/overview/billing-usage";
const Sales = React.lazy(() =>
  import("@/components/dashboard/overview/sales").then((module) => ({
    default: module.Sales,
  }))
);
import UsageFilter from "@/components/dashboard/overview/usage-filter";
import UsageHeader from "@/components/dashboard/overview/usage-header";
import { boarderRadius } from "@/utils";

//export const metadata = {
//   title: `Usage - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function UsageHistoryPage(): React.JSX.Element {
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      <UsageHeader />
      <Grid lg={8} xs={12}>
        <UsageFilter />
        <Sales
          path="usage-history"
          chartSeries={[
            {
              name: "2025",
              data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20],
            },
            { name: "2024", data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: "100%" }}
        />
        {/* <BarChart /> */}

        <BarChart />
      </Grid>
    </Card>
  );
}
