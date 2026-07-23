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

  // const fields = [
  //   {
  //     label: "Meter #",
  //     value: accountInfo?.customer_data?.[0]?.meterNumber,
  //   },
  //   {
  //     label: "Email",
  //     value: accountInfo?.customer_data?.[0]?.email,
  //   },
  //   {
  //     label: "Primary Phone",
  //     value: accountInfo?.customer_data?.[0]?.phone,
  //   },
  //   {
  //     label: "Alt Phone",
  //     value: accountInfo?.customer_data?.[0]?.phone2,
  //   },

  //     {
  //     label: "Service Address",
  //     value: accountInfo?.customer_data?.[0]?.service_address,
  //   },
  // ];

  const fields = [

    {
      label: "Meter #",
      value: accountInfo?.customer_data?.[0]?.meterNumber,
      icon: Gauge,
    },
    {
      label: "Email",
      value: accountInfo?.customer_data?.[0]?.email,
      icon: EnvelopeSimple,
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
      label: "Service Address",
      value: accountInfo?.customer_data?.[0]?.service_address,
      icon: MapPin,
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
      {/* <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Avatar src={company_logo} sx={{ height: "80px", width: "max-content", borderRadius: "0" }} />
        
          <Box >


            <Typography variant="h6">
              {customer_name}
            </Typography>




            <Typography >
              {address}
            </Typography>
          </Box>

           <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: { xs: "flex-start", md: "flex-end" },
      gap: 0.5,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      Account Number
    </Typography>

    <Typography fontWeight={600}>
      {acctnum}
    </Typography>

  </Box>

  <Box>
     <Typography variant="body2">
      I am the <strong>{role || "Owner"}</strong>
    </Typography>
  </Box>
        </Stack>
      </CardContent> */}
      <CardContent>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
        >
          {/* Logo */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: { xs: "100%", md: "auto" },
              alignItems: "center",
            }}
          >


            <Avatar
              src={company_logo}
              sx={{
                width: { xs: 100, md: 120 },
                height: { xs: 70, md: 80 },
                borderRadius: 0,
              }}
            />

          </Box>

          {/* Details */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />
            }
            sx={{ px: { xs: "0" }, alignItems: { xs: "left", md: "center" } }}
          >
            {/* Customer */}
            <Box
              sx={{
                flex: 2,
                px: { xs: 0, md: 3 },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <Typography variant="h6">{customer_name}</Typography>

              <Typography color="text.secondary">
                {address}
              </Typography>
            </Box>

            {/* Mobile Divider */}
            <Divider sx={{ display: { xs: "block", md: "none" }, my: 2 }} />

            {/* Account */}
            {/* <Box
              sx={{
                flex: 1,
                px: { xs: 0, md: 3 },
                textAlign: "center",
              }}
            >
              <Typography variant="h6">Account #</Typography>

              <Typography color="text.secondary">
                {acctnum}
              </Typography>
            </Box> */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: { xs: 0, md: 3 },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#EEF4FF",
                  color: "#2563EB",
                  width: 46,
                  height: 46,
                }}
              >
                <IdentificationCard size={22} />
              </Avatar>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Account Number
                </Typography>

                <Typography fontWeight={600}>
                  {acctnum}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ display: { xs: "block", md: "none" }, my: 2 }} />

            {/* Role */}
            {/* <Box
              sx={{
                flex: 1,
                px: { xs: 0, md: 3 },
                textAlign: "center",
              }}
            >
              <Typography variant="h6">I am the</Typography>

              <Typography color="text.secondary">
                {role || "Owner"}
              </Typography>
            </Box> */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: { xs: 0, md: 3 },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#ECFDF3",
                  color: "#16A34A",
                  width: 46,
                  height: 46,
                }}
              >
                <UserCircle size={22} />
              </Avatar>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  I am the
                </Typography>

                <Typography fontWeight={600}>
                  {role || "Owner"}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Stack>
      </CardContent>

      <Divider sx={{
        width: "96%",
        mx: "auto",
      }} />
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
