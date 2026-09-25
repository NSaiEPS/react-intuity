import * as React from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Question } from "@phosphor-icons/react";
import { tooltipSx } from "@/utils/config";

// ─── Props ─────────────────────────────────────────────────────────────────────
interface AddAccountStepTwoProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  showError: (err: unknown) => unknown;
  accountDetails?: {
    account_no?: string;
    acctnum?: string;
    customer_name?: string;
    name?: string;
  };
  accountNumber?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function AddAccountStepTwo({
  control,
  errors,
  showError,
  accountDetails,
  accountNumber,
}: AddAccountStepTwoProps): React.JSX.Element {
  const [notifEmailFocused, setNotifEmailFocused] = React.useState(false);
  const [confirmNotifEmailFocused, setConfirmNotifEmailFocused] = React.useState(false);

  const displayAccountNo =
    accountDetails?.account_no || accountDetails?.acctnum || accountNumber || "";
  const displayCustomerName =
    accountDetails?.customer_name || accountDetails?.name || "";

  return (
    <>
      {/* Account summary */}
      {(displayAccountNo || displayCustomerName) ? (
        <Box
          sx={{
            backgroundColor: "#f8fafc",
            border: "1px solid #eaecf0",
            borderRadius: "10px",
            px: 2,
            py: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {displayAccountNo && (
            <Typography variant="body2">
              <strong>Account Number:</strong> {displayAccountNo}
            </Typography>
          )}
          {displayCustomerName && (
            <Typography variant="body2">
              <strong>Customer Name:</strong> {displayCustomerName}
            </Typography>
          )}
        </Box>
      ) : null}

      {/* Notification Email */}
      <Controller
        name="notificationEmail"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!showError(errors.notificationEmail)}>
            <InputLabel
              shrink={notifEmailFocused || Boolean(field.value)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Notification Email *
            </InputLabel>
            <OutlinedInput
              {...field}
              notched={notifEmailFocused || Boolean(field.value)}
              label="Notification Email *"
              onFocus={() => setNotifEmailFocused(true)}
              onBlur={() => {
                field.onBlur();
                setNotifEmailFocused(false);
              }}
              startAdornment={
                <EnvelopeSimple size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title="This email is where you will receive notifications and may be the same as a username."
                    placement="top"
                    arrow
                    enterTouchDelay={0}
                    leaveTouchDelay={3000}
                    componentsProps={{ tooltip: { sx: tooltipSx } }}
                  >
                    <IconButton size="small" edge="end">
                      <Question size={20} color="#90caf9" weight="fill" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
            />
            {showError(errors.notificationEmail) && (
              <FormHelperText>{errors.notificationEmail?.message as string}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Confirm Notification Email */}
      <Controller
        name="confirmNotificationEmail"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!showError(errors.confirmNotificationEmail)}>
            <InputLabel
              shrink={confirmNotifEmailFocused || Boolean(field.value)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Confirm Notification Email *
            </InputLabel>
            <OutlinedInput
              {...field}
              notched={confirmNotifEmailFocused || Boolean(field.value)}
              label="Confirm Notification Email *"
              onFocus={() => setConfirmNotifEmailFocused(true)}
              onBlur={() => {
                field.onBlur();
                setConfirmNotifEmailFocused(false);
              }}
              startAdornment={
                <EnvelopeSimple size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
            />
            {showError(errors.confirmNotificationEmail) && (
              <FormHelperText>{errors.confirmNotificationEmail?.message as string}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </>
  );
}
