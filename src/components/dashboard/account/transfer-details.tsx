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


  //console.log(transferInfo,'transferInfo');
  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Card
          sx={{
            borderRadius: 0,
          }}
        >
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Account name</InputLabel>

                  <OutlinedInput
                    disabled={true}
                    id="account-name"
                    value={customer_name}
                    // onChange={handleChange}
                    name="firstName"

                    label="Account name"
                    sx={{
                      height: 44,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Account #</InputLabel>
                  {/* <OutlinedInput id="account-#" disabled label="Account #" name="lastName" value={acctnum} /> */}
                  <OutlinedInput
                    disabled={true}
                    id="account-#"
                    value={acctnum}
                    // onChange={handleChange}
                    name="firstName"

                    label="Account #"
                    sx={{
                      height: 44,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Meter #</InputLabel>
                  {/* <OutlinedInput disabled value={meterNumber} label="Meter #" name="Meter" /> */}
                  <OutlinedInput
                    disabled={true}
                    id="Meter-#"
                    value={meterNumber}
                    // onChange={handleChange}
                    name="Meter"

                    label="Meter"
                    sx={{
                      height: 44,
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Service Address</InputLabel>
                  {/* <OutlinedInput value={service_address} disabled name="service" label="Service Address" /> */}
                  <OutlinedInput
                    disabled={true}
                    id="Service-Address"
                    value={service_address}
                    // onChange={handleChange}
                    name="service"

                    label="Service Address"
                    sx={{
                      height: 44,
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
        </Card>
      </form>
      <CustomBackdrop
        open={accountLoading}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <Loader />
      </CustomBackdrop>
    </>
  );
}
