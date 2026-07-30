import * as React from "react";

import { RootState } from "@/state/store";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Grid from "@mui/material/Unstable_Grid2";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useSelector } from "@/hooks/redux";
import { Box, Typography, Avatar } from "@mui/material";
import {
  User,
  IdentificationCard,
  Gauge,
  MapPin,
} from "@phosphor-icons/react";

export function TransferDetailsForm(): React.JSX.Element {
  const { transferInfo, accountLoading } = useSelector(
    (state: RootState) => state?.Account
  );

  const {
    customer_name = "",
    acctnum = "",
    service_address = "",
    meterNumber = "",
  } = transferInfo?.customer_data?.[0] || {};

  const fields = [
    {
      label: "Account Name",
      value: customer_name,
      icon: User,
    },
    {
      label: "Service Address",
      value: service_address,
      icon: MapPin,
    },
    {
      label: "Account #",
      value: acctnum,
      icon: IdentificationCard,
    },
    {
      label: "Meter #",
      value: meterNumber,
      icon: Gauge,
    },

  ];


  //console.log(transferInfo,'transferInfo');
  return (
    <>
      <Box>
        <Card
          elevation={0}

          sx={{
            borderRadius: 0,
            // boxShadow: "none",
            border: "none",
          }}
        >
          <CardContent sx={{ boxShadow: "none" }}>
            <Grid container spacing={3}>
              {fields.map(({ label, value, icon: Icon }) => (
                <Grid xs={12} md={6} key={label}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1,
                      boxShadow: "none",
                      border: "none",
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
                        sx={{ mb: 0.3 }}
                      >
                        {label}
                      </Typography>

                      <Typography variant="body1" fontWeight={600}>
                        {value || "-"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
          {/* <Divider /> */}
        </Card>
      </Box>
      <CustomBackdrop
        open={accountLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </>
  );
}
