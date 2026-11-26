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

  const customerSummary =
    accountNumber !== "-" ? `${customerName} (${accountNumber})` : String(customerName);

  const items = [
    { key: "customer", label: null as string | null, value: customerSummary },
    { key: "service-address", label: "Service Address", value: serviceAddress },
    { key: "billing-address", label: "Billing Address", value: billingAddress },
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
              fontSize: "1.05rem",
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            Account Information
          </Typography>
          <Divider sx={{ mt: 0.75, borderColor: "#EAEAEA" }} />
        </Box>

        <Stack spacing={0.75} sx={{ flex: "1 1 auto", justifyContent: "space-between" }}>
          {items.map(({ key, label, value }) => (
            <Box key={key} sx={{ minWidth: 0 }}>
              {label ? (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    lineHeight: 1.25,
                    mb: 0.2,
                  }}
                >
                  {label}
                </Typography>
              ) : null}
              <Typography
                variant="body2"
                noWrap
                sx={{
                  color: "text.primary",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  lineHeight: 1.3,
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
