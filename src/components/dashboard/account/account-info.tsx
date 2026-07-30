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
import { Box, CardHeader, Divider, Grid } from "@mui/material";
import {
  IdentificationCard,
  UserCircle,
} from "@phosphor-icons/react";
import {
  User,
  Gauge,
  MapPin,
  House,
  Phone,
  DeviceMobile,
  EnvelopeSimple,
  ChatCircle,
} from "@phosphor-icons/react";


export function AccountInfo(): React.JSX.Element {
  const { accountInfo } = useSelector((state: RootState) => state?.Account);
  const { customer_name, address, acctnum,
    role, } = accountInfo?.customer_data?.[0] || {};
  const CustomerInfo = getLocalStorage("intuity-customerInfo");

  console.log(accountInfo, "accountInfo");


  const { company_logo }: { company_logo?: string } =
    (typeof CustomerInfo === "object" && CustomerInfo) || {};

  const fields = [
    {
      label: "Account Name",
      value: customer_name,
      icon: User,
    },
    {
      label: "Email",
      value: accountInfo?.customer_data?.[0]?.email,
      icon: EnvelopeSimple,
    },
    {
      label: "Account Number",
      value: acctnum,
      icon: IdentificationCard,
    },
    {
      label: "Meter #",
      value: accountInfo?.customer_data?.[0]?.meterNumber,
      icon: Gauge,
    },
    {
      label: "Service Address",
      value: accountInfo?.customer_data?.[0]?.service_address,
      icon: MapPin,
    },
    {
      label: "Billing Address",
      value: address,
      icon: House,
    },
    {
      label: "Primary Phone",
      value: accountInfo?.customer_data?.[0]?.phone,
      icon: Phone,
    },
    {
      label: "Alt Phone",
      value: accountInfo?.customer_data?.[0]?.phone2,
      icon: DeviceMobile,
    },
    {
      label: "I am the",
      value: role || "Owner",
      icon: UserCircle,
    },

  ];


  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: boarderRadius.card,
        border: "1px solid #EAEAEA",
        backgroundColor: "#fff",

      }}
    >
      <CardHeader
        title="Current Information"
        sx={{ pt: 2, pb: 2 }}
      />

      <Divider />

     

      {/* <Divider sx={{
        width: "96%",
        mx: "auto",
      }} /> */}
      {/* <Card sx={{ borderRadius: 1 }}> */}
      <CardContent sx={{ pt: 2.5 }}>


        {/* <Grid container spacing={2}>
          {fields.map(({ label, value }) => (
            <Grid item xs={12} md={6} key={label}>
              <Box
                sx={{
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                <Typography
                  fontSize={15}
                  fontWeight={600}
                  mb={0.5}
                >
                  {label}
                </Typography>

                <Typography
                  fontSize={14}
                  color="text.secondary"
                  mb={1}
                >
                  {value || "-"}
                </Typography>

                <Divider />
              </Box>
            </Grid>
          ))}
        </Grid> */}

        <Grid container spacing={3} alignItems="flex-start">
          {fields.map(({ label, value, icon: Icon }) => (
            <Grid item xs={12} md={6} key={label}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                  pb: 2,
                  // borderBottom: "1px solid #ECECEC",
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "#EEF4FF",
                    color: "#2563EB",
                  }}
                >
                  <Icon size={22} weight="regular" />
                </Avatar>

                <Box flex={1}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.3, }}
                  >
                    {label}
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={600}
                  >
                    {value || "-"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      {/* </Card>s */}
    </Card>
  );
}
