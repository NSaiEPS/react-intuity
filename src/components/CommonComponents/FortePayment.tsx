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
} from "@mui/material";

interface FortePaymentProps {
  onSuccess: (data: any) => void;
}

declare global {
  interface Window {
    onTokenCreated?: (res: any) => void;
    onTokenFailed?: (err: any) => void;
    forte?: any;
  }
}

const FORTE_LOGIN_ID = "873DF49605"; // move to env later

const FortePayment: FC<FortePaymentProps> = ({ onSuccess }) => {
  const [ready, setReady] = useState(false);

  // 1️⃣ Load Forte Script
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
      //console.log("✅ Forte Loaded");
      setReady(true);
    };

    script.onerror = () => {
      console.error("❌ Failed to load Forte");
    };

    document.head.appendChild(script);
  }, []);

  // 2️⃣ Register Callbacks
  useEffect(() => {
    window.onTokenCreated = (response: any) => {
      //console.log("Forte token success:", response);

      const expMonth = String(response.expire_month ?? "").padStart(2, "0");
      const fullYear = String(response.expire_year ?? "");
      const expYearFull = fullYear.length === 2 ? `20${fullYear}` : fullYear;
      const expYearShort = expYearFull.slice(-2);
      const formattedExpiration = `${expMonth}/${expYearFull}`;

      // Pass complete Forte response and mapped fields
      onSuccess({
        token: response.onetime_token,
        forte_token: response.onetime_token,
        forte_response: response,
        cardNumber: response.last_4,
        credit_card_number: response.last_4,
        cardType: response.card_type,
        card_type: response.card_type,
        expiration: formattedExpiration,
        cardExpDate: `${expMonth}${expYearShort}`,
      });
    };

    window.onTokenFailed = (error: any) => {
      console.error("Forte error:", error);
      alert(error?.response_description || "Payment failed");
    };
  }, [onSuccess]);

  // 3️⃣ Submit Handler
  const handleSubmit = () => {
    if (!window.forte) {
      alert("Forte not loaded yet");
      return;
    }

    const getValue = (name: string) =>
      document.querySelector<HTMLInputElement>(
        `#forte-payment-form [forte-data="${name}"]`
      )?.value;
      console.log( getValue('card_number'),'clicked')

    window.forte
      .createToken({
        api_login_id: FORTE_LOGIN_ID,
        card_number: getValue("card_number"),
        expire_month: getValue("expire_month"),
        expire_year: getValue("expire_year"),
        cvv: getValue("cvv"),
      })
      .success(window.onTokenCreated)
      .error(window.onTokenFailed);
      console.log(  window.forte,'clicked')
  };

  const currentYear = new Date().getFullYear();

  return (
    // <form id="forte-payment-form" action="javascript:void(0)">
    //   <h3>Credit / Debit Card</h3>

    //   <label>Card Number</label>
    //   <input type="text" forte-data="card_number" />

    //   <label>Exp Month</label>
    //   <select forte-data="expire_month">
    //     {[...Array(12)].map((_, i) => (
    //       <option key={i + 1} value={i + 1}>
    //         {i + 1}
    //       </option>
    //     ))}
    //   </select>

    //   <label>Exp Year</label>
    //   <select forte-data="expire_year">
    //     {[...Array(12)].map((_, i) => {
    //       const year = new Date().getFullYear() + i;
    //       return (
    //         <option key={year} value={year}>
    //           {year}
    //         </option>
    //       );
    //     })}
    //   </select>

    //   <label>CVV</label>
    //   <input type="text" forte-data="cvv" />

    //   <button
    //     type="button"
    //     forte-api-login-id={FORTE_LOGIN_ID}
    //     forte-callback-success="onTokenCreated"
    //     forte-callback-error="onTokenFailed"
    //     onClick={handleSubmit}
    //     disabled={!ready}
    //   >
    //     Submit Payment
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
          maxWidth: 500,
          borderRadius: 3,
          boxShadow: 4,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={600}
            mb={3}
            textAlign="center"
          >
            Credit Card
          </Typography>

          <form id="forte-payment-form" action="javascript:void(0)">
            <Grid container spacing={2}>
              {/* Card Number */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  variant="outlined"
                  inputProps={{
                    "forte-data": "card_number",
                  }}
                />
              </Grid>

              {/* Exp Month */}
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Exp Month"
                  inputProps={{
                    "forte-data": "expire_month",
                  }}
                >
                  {[...Array(12)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {String(i + 1).padStart(2, "0")}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Exp Year */}
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Exp Year"
                  inputProps={{
                    "forte-data": "expire_year",
                  }}
                >
                  {[...Array(12)].map((_, i) => {
                    const year = currentYear + i;
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              {/* CVV */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CVV"
                  variant="outlined"
                  inputProps={{
                    "forte-data": "cvv",
                  }}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!ready}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  {ready ? "Submit Payment" : "Loading..."}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FortePayment;
