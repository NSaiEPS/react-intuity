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
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";

interface ForteACHProps {
  onSuccess: (data: any) => void;
  invoiceId?: string | null;
  amount: string;
  convenience_fee: string;
  apiLoginId?: string;
  jsUrl?: string;
  environment?: string;
}

declare global {
  interface Window {
    Forte?: any;
    onACHTokenCreated?: (res: any) => void;
    onACHTokenFailed?: (err: any) => void;
  }
}

const ForteACH: FC<ForteACHProps> = ({
  onSuccess,
  apiLoginId: propApiLoginId,
  jsUrl: propJsUrl,
  environment: propEnvironment,
}) => {
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  // Forte only accepts "c" / "s" for account_type, so ownership is captured separately
  const [accountOwnership, setAccountOwnership] = useState("personal");
  const [accountType, setAccountType] = useState("c");

  const paymentProcessorDetails = useSelector(
    (state: RootState) => state?.Account?.paymentProcessorDetails
  );

  const forteConfig =
    paymentProcessorDetails?.forte_ach_115?.[0] ||
    paymentProcessorDetails?.forte_115?.[0] ||
    paymentProcessorDetails?.current_processor_ach?.find((p: any) => p?.config_value?.includes("forte")) ||
    paymentProcessorDetails?.forte_ach?.[0] ||
    paymentProcessorDetails?.forte?.[0];

  const resolvedApiLoginId = propApiLoginId || forteConfig?.api_login_id;
  const resolvedEnvironment = propEnvironment || forteConfig?.environment || "sandbox";
  const resolvedJsUrl =
    propJsUrl ||
    forteConfig?.js_url ||
    (resolvedEnvironment === "live" || resolvedEnvironment === "production"
      ? "https://api.forte.net/js/v1"
      : "https://sandbox.forte.net/api/js/v1");

  // our own API still expects the legacy PC / PS / BC / BS codes
  const legacyAccountType =
    (accountOwnership === "business" ? "B" : "P") +
    (accountType === "s" ? "S" : "C");

  // Load Forte Script dynamically
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

  const handleTokenCreated = (response: any) => {
    onSuccess({
      token: response.onetime_token,
      forte_token: response.onetime_token,
      forte_response: response,
      accountNumber: response.last_4,
      routingNumber: response.routing_number ?? routingNumber,
      accountType: legacyAccountType,
    });
  };

  const handleTokenFailed = (error: any) => {
    console.error("Forte ACH error:", error);
    alert(error?.response_description || "ACH Payment failed");
  };

  useEffect(() => {
    window.onACHTokenCreated = handleTokenCreated;
    window.onACHTokenFailed = handleTokenFailed;
  });

  const handleSubmit = () => {
    if (!resolvedApiLoginId) {
      alert("Payment processor configuration is missing.");
      return;
    }

    if (!window.forte) {
      alert("Forte not loaded");
      return;
    }

    if (!authorized) {
      alert("Please authorize before continuing.");
      return;
    }

    const account_number = accountNumber.replace(/\s|-/g, "");
    const routing_number = routingNumber.replace(/\s|-/g, "");

    if (!account_number || !routing_number) {
      alert("Please enter the routing number and account number.");
      return;
    }
    window.forte
      .createToken({
        api_login_id: resolvedApiLoginId,
        account_number,
        routing_number,
        account_type: accountType,
      })
      .success(handleTokenCreated)
      .error(handleTokenFailed);
  };

  const handleReset = () => {
    setRoutingNumber("");
    setAccountNumber("");
    setAccountOwnership("personal");
    setAccountType("c");
    setAuthorized(false); // reset checkbox state
  };

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
              color: "red",

            }}
          >
            ⚠️ WARNING! Only click this button ONCE!
          </Alert>

          <form id="forte-ach-form" action="javascript:void(0)">
            <Grid container spacing={3}>
              {/* Routing Number */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Routing Number"
                  variant="standard"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
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
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  inputProps={{
                    "forte-data": "account_number",
                  }}
                />
              </Grid>

              {/* Account Ownership */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Account Ownership"
                  variant="standard"
                  value={accountOwnership}
                  onChange={(e) => setAccountOwnership(e.target.value)}
                >
                  <MenuItem value="personal">Personal Bank Account</MenuItem>
                  <MenuItem value="business">Business Bank Account</MenuItem>
                </TextField>
              </Grid>

              {/* Account Type */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Account Type"
                  variant="standard"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  SelectProps={{ native: true }}
                  inputProps={{
                    "forte-data": "account_type",
                  }}
                >
                  <option value="c">Checking</option>
                  <option value="s">Savings</option>
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
