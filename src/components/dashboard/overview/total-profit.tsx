import * as React from "react";
import { useRouter } from "next/navigation"; // Correct hook for App Router

import { RootState } from "@/state/store";
import { boarderRadius, formatToMMDDYYYY } from "@/utils";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";

import { paths } from "@/utils/paths";

export interface TotalProfitProps {
  sx?: SxProps;
  value?: string;
}

export function TotalProfit({
  value,
  sx,
}: TotalProfitProps): React.JSX.Element {
  const router = useRouter(); // Use the hook from next/navigation
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  const { last_bill, next_bill_days, next_bill } =
    dashBoardInfo?.body?.customer || {};
  console.log(dashBoardInfo, "dashBoardInfo");
  return (
    <Card
      onClick={() => {
        if (value === "history") {
          router.push(paths.dashboard.usageHistory());
        }
      }}
      sx={{
        ...sx,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        borderRadius: boarderRadius.card,
        padding: 2,
        paddingTop: 1,
      }}
    >
      <CardContent sx={{ flex: 1, width: "100%" }}>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {value === "BillDue"
              ? "Bill Due Date"
              : "Remaining days until late fees or penalties may be assessed"}
          </Typography>

          <Typography variant="h3" fontWeight={700} mt={"auto"}>
            {value === "BillDue" ? formatToMMDDYYYY(next_bill) : next_bill_days}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
