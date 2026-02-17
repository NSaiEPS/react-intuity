import { FC, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { useRef } from "react";


interface ForteACHProps {
  onSuccess: (data: any) => void;
  invoiceId?: string | null;
  amount: string;
  convenience_fee: string;
}

declare global {
  interface Window {
    Forte?: any;
    onACHTokenCreated?: (res: any) => void;
    onACHTokenFailed?: (err: any) => void;
  }
}

const FORTE_LOGIN_ID = "7B0A10728C";

const ForteACH: FC<ForteACHProps> = ({
  onSuccess,
}) => {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);


  // Load Forte Script
  useEffect(() => {
    if (document.getElementById("forte-js")) {
      setReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "forte-js";
    script.src = "https://sandbox.forte.net/api/js/v1";
    script.defer = true;
    script.setAttribute("forte-api-login-id", FORTE_LOGIN_ID);

    script.onload = () => {
      setReady(true);
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    window.onACHTokenCreated = (response: any) => {
      onSuccess({
        token: response.onetime_token,
        accountNumber: response.last_4,
        routingNumber: response.routing_number,
        accountType: response.account_type,
      });
    };

    window.onACHTokenFailed = (error: any) => {
      alert(error?.response_description || "ACH Payment failed");
    };
  }, [onSuccess]);

  const handleSubmit = () => {
    if (!window.Forte) {
      alert("Forte not loaded");
      return;
    }

     if (!authorized) {
      alert("Please authorize before continuing.");
      return;
    }

    window.Forte.createToken({
      formId: "forte-ach-form",
    });
  };

  const handleReset = () => {
  if (formRef.current) {
    formRef.current.reset(); // resets all input fields
  }

  setAuthorized(false); // reset checkbox state
};


  return (
    // <form id="forte-ach-form" action="javascript:void(0)">
    //   <h3>Bank Account Payment</h3>

    //   <label>Routing Number</label>
    //   <input type="text" forte-data="routing_number" />

    //   <label>Account Number</label>
    //   <input type="text" forte-data="account_number" />

    //   <label>Account Type</label>
    //   <select forte-data="account_type">
    //     <option value="checking">Checking</option>
    //     <option value="savings">Savings</option>
    //   </select>

    //   <button
    //     type="button"
    //     forte-api-login-id={FORTE_LOGIN_ID}
    //     forte-callback-success="onACHTokenCreated"
    //     forte-callback-error="onACHTokenFailed"
    //     onClick={handleSubmit}
    //     disabled={!ready}
    //   >
    //     Submit Bank Payment
    //   </button>
    // </form>

      <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        px: 2,
        py: 4,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent>
          {/* Warning */}
          <Alert
            severity="warning"
            icon={false}
            sx={{
              mb: 3,
              fontWeight: 600,
              justifyContent: "center",
               backgroundColor: "transparent",
              color:"red",
              
            }}
          >
            ⚠️ WARNING! Only click this button ONCE!
          </Alert>

          <form id="forte-ach-form"  ref={formRef} action="javascript:void(0)">
            <Grid container spacing={3}>
              {/* Routing Number */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Routing Number"
                  variant="standard"
                  inputProps={{
                    "forte-data": "routing_number",
                  }}
                />
              </Grid>

              {/* Account Number */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Account Number"
                  variant="standard"
                  inputProps={{
                    "forte-data": "account_number",
                  }}
                />
              </Grid>

              {/* Account Type */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Account Type"
                  variant="standard"
                  inputProps={{
                    "forte-data": "account_type",
                  }}
                >
                  {/* <MenuItem value="checking">Checking</MenuItem>
                  <MenuItem value="savings">Savings</MenuItem> */}
                  <MenuItem value="PC">Personal Checking</MenuItem>
                            <MenuItem value="PS">Personal Savings</MenuItem>
                            <MenuItem value="BC">Business Checking</MenuItem>
                            <MenuItem value="BS">Business Savings</MenuItem>
                            <MenuItem value="GL">General Ledger</MenuItem>
                </TextField>
              </Grid>

              {/* Authorization */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Checkbox
                    checked={authorized}
                    onChange={(e) => setAuthorized(e.target.checked)}
                    sx={{ mt: 0.5 }}
                  />
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    SANDBOX - I authorize Creative Technologies - Eldorado to
                    store and enroll the bank account indicated in this form
                    for payment of one-time and/or auto recurring transactions
                    for amounts due on my utility account on or before the due
                    date. I understand that the authorization will remain in
                    effect until I cancel it and that payments may be withdrawn
                    from my account on the same or next banking business day
                    after it is originated.
                  </Typography>
                </Box>
              </Grid>

              {/* Continue Button */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!ready || !authorized}
                  onClick={handleSubmit}
                  forte-api-login-id={FORTE_LOGIN_ID}
                  forte-callback-success="onACHTokenCreated"
                  forte-callback-error="onACHTokenFailed"
                  sx={{
                    mt: 2,
                    py: 1.6,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "uppercase",
                  }}
                >
                  {ready ? "CONTINUE" : "Loading..."}
                </Button>
              </Grid>
              <Grid item xs={12}>
  <Button
    fullWidth
    variant="outlined"
    size="large"
    onClick={handleReset}
    sx={{
      py: 1.6,
      borderRadius: 3,
      fontWeight: 600,
      fontSize: "1rem",
      textTransform: "uppercase",
    }}
  >
    RESET
  </Button>
</Grid>

            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForteACH;
