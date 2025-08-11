import * as React from "react";

import { stopTransferService } from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { boarderRadius } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Grid from "@mui/material/Unstable_Grid2";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";

export function TransferDetailsForm(): React.JSX.Element {
  const { transferInfo, accountLoading } = useSelector(
    (state: RootState) => state?.Account
  );

  const {
    customer_name,
    acctnum,
    address,
    phone,
    email,
    role,
    comment,
    service_address,
    phone2,
    id,
    meterNumber,
  } = transferInfo?.customer_data?.[0] || {};

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Card
          sx={{
            borderRadius: boarderRadius.card,
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
                    defaultValue="Sofia"
                    label="Account name"
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
                    defaultValue="Sofia"
                    label="Account #"
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
                    defaultValue="Sofia"
                    label="Meter"
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
                    defaultValue="Sofia"
                    label="Service Address"
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
