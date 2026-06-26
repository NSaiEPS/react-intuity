import * as React from "react";
import { Card, Grid } from "@mui/material";
import BarChart from "@/components/dashboard/overview/billing-usage";
const Sales = React.lazy(() =>
  import("@/components/dashboard/overview/sales").then((module) => ({
    default: module.Sales,
  }))
);
import UsageFilter from "@/components/dashboard/overview/usage-filter";
import UsageHeader from "@/components/dashboard/overview/usage-header";
import { boarderRadius } from "@/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { UsageHistorySkeleton } from "@/components/dashboard/skeletons";

export default function UsageHistoryPage(): React.JSX.Element {
  const usageGraph = useSelector((state: RootState) => state?.DashBoard?.usageGraph);
  const hasUsageData = !!usageGraph && Object.keys(usageGraph).length > 0;

  return (
    <>
      {!hasUsageData && <UsageHistorySkeleton />}
      <Card sx={{ borderRadius: boarderRadius.card, display: !hasUsageData ? 'none' : 'block' }}>
        <UsageHeader />
        <Grid lg={8} xs={12}>
          <UsageFilter />
          <Sales
            path="usage-history"
            chartSeries={[]}
            sx={{ height: "100%" }}
          />
          <BarChart />
        </Grid>
      </Card>
    </>
  );
}
