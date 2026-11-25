import * as React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { boarderRadius } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";

export interface AccountInfoCardProps {
  sx?: SxProps;
}

export const AccountInfoSkeleton = (): React.JSX.Element => (
  <Card
    elevation={0}
    sx={{
      borderRadius: boarderRadius.card,
      backgroundColor: "#fff",
      border: "1px solid #EAEAEA",
      boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <CardContent
      sx={{
        p: 2,
        "&:last-child": { pb: 2 },
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Skeleton variant="text" width="60%" height={22} />
        <Divider sx={{ mt: 1, borderColor: "#EAEAEA" }} />
      </Box>
      <Stack spacing={1} sx={{ flex: "1 1 auto", justifyContent: "space-between" }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i}>
            <Skeleton variant="text" width="40%" height={12} sx={{ mb: 0.2 }} />
            <Skeleton variant="text" width="75%" height={16} />
          </Box>
        ))}
      </Stack>
    </CardContent>
  </Card>
);

export function AccountInfoCard({ sx }: AccountInfoCardProps): React.JSX.Element {
  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);
  const CustomerInfo = getLocalStorage("intuity-customerInfo") as Record<string, any> | null;

  const customer =
    dashBoardInfo?.body?.customer || dashBoardInfo?.customer || CustomerInfo || {};

  const accountNumber =
    customer?.acctnum || customer?.account_number || customer?.account_no || "-";
  const customerName =
    customer?.name || customer?.customer_name || customer?.user_name || "-";
  const serviceAddress =
    customer?.service_address || customer?.customer_address || "-";
  const billingAddress =
    customer?.address || customer?.billing_address || "-";

  const items = [
    { label: "Account Number", value: accountNumber },
    { label: "Customer Name", value: customerName },
    { label: "Service Address", value: serviceAddress },
    { label: "Billing Address", value: billingAddress },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: boarderRadius.card,
        backgroundColor: "#fff",
        border: "1px solid #EAEAEA",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: 2,
          "&:last-child": { pb: 2 },
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ mb: 0.75 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              fontSize: "0.95rem",
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            Account Information
          </Typography>
          <Divider sx={{ mt: 0.75, borderColor: "#EAEAEA" }} />
        </Box>

        <Stack spacing={0.75} sx={{ flex: "1 1 auto", justifyContent: "space-between" }}>
          {items.map(({ label, value }) => (
            <Box key={label} sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "text.secondary",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  lineHeight: 1.2,
                  mb: 0.15,
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  color: "text.primary",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={String(value)}
              >
                {value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
