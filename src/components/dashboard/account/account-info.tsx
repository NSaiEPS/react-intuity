import * as React from "react";
import { RootState } from "@/state/store";
import { boarderRadius } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";

export function AccountInfo(): React.JSX.Element {
  const { accountInfo } = useSelector((state: RootState) => state?.Account);
  const { customer_name, address } = accountInfo?.customer_data?.[0] || {};
  const CustomerInfo = getLocalStorage("intuity-customerInfo");

  const { company_logo }: { company_logo?: string } =
    (typeof CustomerInfo === "object" && CustomerInfo) || {};

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: boarderRadius.card,
        border: "1px solid #EAEAEA",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)",
        backgroundColor: "#fff",
      }}
    >
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: "center", py: 1 }}>
          <Avatar src={company_logo} sx={{height:"80px" ,width: "max-content", borderRadius:"0" }} />
          <Stack spacing={0.5} sx={{ textAlign: "center" }}>
            <Typography variant="h5" fontWeight={700}>
              {customer_name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {address}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
