import * as React from "react";
import { useNavigate } from "react-router-dom"; // Correct hook for App Router

import { RootState } from "@/state/store";
import { boarderRadius, formatToMMDDYYYY } from "@/utils";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import type { SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import { IconCards } from "@/components/dashboard/overview/Icon-cards";

import { paths } from "@/utils/paths";
import { Button } from "@mui/material";

export interface TotalProfitProps {
  sx?: SxProps;
  value?: string;
}

export function TotalProfit({
  value,
  sx,
}: TotalProfitProps): React.JSX.Element {
  const navigate = useNavigate(); // Use the hook from next/navigation
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  const { next_bill_days, next_bill } = dashBoardInfo?.body?.customer || {};

  return (
    <Card
      onClick={() => {
        if (value === "history") {
          navigate(paths.dashboard.usageHistory());
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
              : value === "CustomerService"
              ? "Customer Service"
              : "Remaining days until late fees or penalties may be assessed"}
          </Typography>
          {value === "CustomerService" ? (
            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<IconCards type={"Headphones"} />}
                // variant="outlined"
                // color="primary"

                sx={{
                  textTransform: "none",

                  color: "black",
                }}
              >
                Call
              </Button>

              <Button
                startIcon={<IconCards type={"Envelope"} />}
                // variant="outlined"
                // color="primary"
                sx={{ textTransform: "none", color: "black" }}
              >
                Email
              </Button>
            </Stack>
          ) : (
            <Typography variant="h3" fontWeight={700} mt={"auto"}>
              {value === "BillDue"
                ? formatToMMDDYYYY(next_bill)
                : next_bill_days}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
