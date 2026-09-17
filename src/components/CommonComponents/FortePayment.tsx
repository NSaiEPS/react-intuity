import { FC, useEffect, useState } from "react";
import { useSelector } from "@/hooks/redux";
import { RootState } from "@/state/store";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";

interface FortePaymentProps {
  onSuccess: (data: any) => void;
  apiLoginId?: string;
  jsUrl?: string;
  environment?: string;
}

declare global {
  interface Window {
    onTokenCreated?: (res: any) => void;
    onTokenFailed?: (err: any) => void;
    forte?: any;
  }
}

const FortePayment: FC<FortePaymentProps> = ({
  onSuccess,
  apiLoginId: propApiLoginId,
  jsUrl: propJsUrl,
  environment: propEnvironment,
}) => {
  const [ready, setReady] = useState(false);

  const paymentProcessorDetails = useSelector(
    (state: RootState) => state?.Account?.paymentProcessorDetails
  );

  const forteConfig =
    paymentProcessorDetails?.forte_115?.[0] ||
    paymentProcessorDetails?.current_processor?.find((p: any) => p?.config_value?.includes("forte")) ||
    paymentProcessorDetails?.forte?.[0] ||
    paymentProcessorDetails?.forte_ach_115?.[0];

  const resolvedApiLoginId = propApiLoginId || forteConfig?.api_login_id;
  const resolvedEnvironment = propEnvironment || forteConfig?.environment || "sandbox";
  const resolvedJsUrl =
    propJsUrl ||
    forteConfig?.js_url ||
    (resolvedEnvironment === "live" || resolvedEnvironment === "production"
      ? "https://api.forte.net/js/v1"
      : "https://sandbox.forte.net/api/js/v1");

  // 1️⃣ Load Forte Script dynamically
  useEffect(() => {
    if (!resolvedApiLoginId) {
      setReady(false);
      return;
    }

    const existingScript = document.getElementById("forte-js") as HTMLScriptElement | null;
    if (existingScript) {
      if (
        existingScript.getAttribute("forte-api-login-id") === resolvedApiLoginId &&
        (window as any).forte
      ) {
        setReady(true);
        return;
      }
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "forte-js";
    script.src = resolvedJsUrl;
    script.defer = true;
    script.setAttribute("forte-api-login-id", resolvedApiLoginId);

    script.onload = () => {
      setReady(true);
    };

    script.onerror = () => {
      console.error("❌ Failed to load Forte SDK script");
      setReady(false);
    };

    document.head.appendChild(script);
  }, [resolvedApiLoginId, resolvedJsUrl]);

  // 2️⃣ Register Callbacks
  useEffect(() => {
    window.onTokenCreated = (response: any) => {
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
    if (!resolvedApiLoginId) {
      alert("Payment processor configuration is missing.");
      return;
    }

    if (!window.forte) {
      alert("Forte not loaded yet");
      return;
    }

    const getValue = (name: string) =>
      document.querySelector<HTMLInputElement>(
        `#forte-payment-form [forte-data="${name}"]`
      )?.value;

    window.forte
      .createToken({
        api_login_id: resolvedApiLoginId,
        card_number: getValue("card_number"),
        expire_month: getValue("expire_month"),
        expire_year: getValue("expire_year"),
        cvv: getValue("cvv"),
      })
      .success(window.onTokenCreated)
      .error(window.onTokenFailed);
  };

  const currentYear = new Date().getFullYear();

  if (!resolvedApiLoginId) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          px: 2,
        }}
      >
        <CircularProgress size={32} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Loading payment processor configuration...
        </Typography>
      </Box>
    );
  }

  return (
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
