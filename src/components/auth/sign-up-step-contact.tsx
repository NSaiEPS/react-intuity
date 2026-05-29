import * as React from "react";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Question } from "@phosphor-icons/react";
import { dummyCountriesList } from "@/utils";
import { RegisterFormData } from "./sign-up-schema";

const tooltipSx = {
  backgroundColor: "#E7E6E6",
  color: "#000000",
  border: "1px solid #d0cfcf",
  fontSize: "14px",
  lineHeight: 1.4,
  "& .MuiTooltip-arrow": {
    color: "#E7E6E6",
    "&::before": { border: "1px solid #d0cfcf" },
  },
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface StepContactInfoProps {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  showError: (err: unknown) => unknown;
  companyResponse: { account_no?: string; customer_name?: string };
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function StepContactInfo({ control, errors, showError, companyResponse }: StepContactInfoProps) {
  const [notifEmailFocused, setNotifEmailFocused] = React.useState(false);
  const [confirmNotifEmailFocused, setConfirmNotifEmailFocused] = React.useState(false);
  const [phoneFocused, setPhoneFocused] = React.useState(false);

  const formatUS = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  return (
    <>
      {/* Account summary */}
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
        <Typography variant="body2">
          <strong>Account Number:</strong> {companyResponse?.account_no}
        </Typography>
        <Typography variant="body2">
          <strong>Customer Name:</strong> {companyResponse?.customer_name}
        </Typography>
      </Box>

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
              onBlur={() => { field.onBlur(); setNotifEmailFocused(false); }}
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
              <FormHelperText>{errors.notificationEmail?.message}</FormHelperText>
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
              onBlur={() => { field.onBlur(); setConfirmNotifEmailFocused(false); }}
              startAdornment={
                <EnvelopeSimple size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
            />
            {showError(errors.confirmNotificationEmail) && (
              <FormHelperText>{errors.confirmNotificationEmail?.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Country + Phone */}
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Controller
          name="countryCode"
          control={control}
          render={({ field }) => (
            <FormControl error={!!showError(errors.countryCode)} sx={{ minWidth: 160 }}>
              <InputLabel shrink={Boolean(field.value)}>Country</InputLabel>
              <Select {...field} notched={Boolean(field.value)} label="Country">
                {dummyCountriesList.map((country) => (
                  <MenuItem key={country.phone_code} value={country.phone_code}>
                    {`${country.phone_code} - ${country.name}`}
                  </MenuItem>
                ))}
              </Select>
              {showError(errors.countryCode) && (
                <FormHelperText>{errors.countryCode?.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!showError(errors.phone)}>
              <InputLabel
                shrink={phoneFocused || Boolean(field.value)}
                sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
              >
                Mobile No.
              </InputLabel>
              <OutlinedInput
                {...field}
                notched={phoneFocused || Boolean(field.value)}
                label="Mobile No."
                value={formatUS(field.value || "")}
                onChange={(e) => field.onChange(formatUS(e.target.value))}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => { field.onBlur(); setPhoneFocused(false); }}
                placeholder={phoneFocused ? "(555) 000-0000" : ""}
                inputProps={{ maxLength: 14 }}
                startAdornment={
                  <Phone size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
                }
              />
              {showError(errors.phone) && (
                <FormHelperText>{errors.phone?.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Stack>
    </>
  );
}
