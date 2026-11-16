import * as React from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { Gauge, Lightning, Question, User } from "@phosphor-icons/react";
import { RegisterFormData } from "./sign-up-schema";
import { tooltipSx } from "@/utils/config";
import { colors } from "@/utils";

// ─── Tooltip content per verification type ─────────────────────────────────────
const authTooltips: Record<string, React.ReactNode> = {
  last_name: (
    <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
      For last name or business name, only enter one primary word (e.g., The
      Miller &amp; Sons Manufacturing Group, LLC, only enter{" "}
      <strong>Miller</strong>). Do NOT enter punctuation (e.g.,{" "}
      <em>O'Conner &amp; Sons</em>, only enter <strong>Conner</strong>).
    </span>
  ),
  billing_address: (
    <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
      e.g., 1020 W. Maple Rd., only enter
      <strong>
        {" "}
        <br />
        <em>Maple</em>
      </strong>
    </span>
  ),
  pin: "Your personal identification number (PIN) was sent with your new bill email notice. If you cannot find your PIN, select one of the other verification questions.",
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface StepAccountInfoProps {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  showError: (err: unknown) => unknown;
  subState?: "LOOKUP_STATE" | "VERIFICATION_STATE";
  isCashpower?: 0 | 1 | null;
  lookupError?: string | null;
  onClearLookupError?: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function StepAccountInfo({
  control,
  errors,
  showError,
  subState = "LOOKUP_STATE",
  isCashpower = null,
  lookupError,
  onClearLookupError,
}: StepAccountInfoProps) {
  const [accountFocused, setAccountFocused] = React.useState(false);
  const [answerFocused, setAnswerFocused] = React.useState(false);
  const [meterFocused, setMeterFocused] = React.useState(false);

  // 1. LOOKUP_STATE: Show only the Account Number input field (Image #1)
  if (subState === "LOOKUP_STATE") {
    return (
      <Controller
        name="accountNumber"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={Boolean(lookupError || showError(errors.accountNumber))}>
            <InputLabel
              shrink={accountFocused || Boolean(field.value)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Account Number *
            </InputLabel>
            <OutlinedInput
              {...field}
              value={field.value || ""}
              onChange={(e) => {
                field.onChange(e);
                if (onClearLookupError) onClearLookupError();
              }}
              notched={accountFocused || Boolean(field.value)}
              label="Account Number *"
              onFocus={() => setAccountFocused(true)}
              onBlur={() => {
                field.onBlur();
                setAccountFocused(false);
              }}
              startAdornment={
                <User size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={
                      <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
                        Please locate your account number on your statement. If you received a “Utility Bill Ready” email notification, your account number can be found at the top of the email content.
                      </span>
                    }
                    placement="top"
                    arrow
                    enterTouchDelay={0}
                    leaveTouchDelay={3000}
                    componentsProps={{ tooltip: { sx: tooltipSx } }}
                  >
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <Question size={20} color="#90caf9" weight="fill" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
            />
            {(lookupError || showError(errors.accountNumber)) && (
              <FormHelperText>
                {lookupError || errors.accountNumber?.message}
              </FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // 2. VERIFICATION_STATE - CashPower Flow (Image #2)
  if (isCashpower === 1) {
    return (
      <Box
        sx={{
          backgroundColor: "#f4f8fd",
          border: "1px solid #d4e5f9",
          borderRadius: "14px",
          p: { xs: 2, sm: 3 },
          mb: 1,
        }}
      >
        {/* CashPower Banner Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "#dceafd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Lightning size={26} color={colors.blue} weight="fill" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: colors.blue, lineHeight: 1.2 }}>
              CashPower Account
            </Typography>
            <Typography variant="body2" sx={{ color: "#555", mt: 0.25 }}>
              This account uses prepaid (CashPower) meters.
            </Typography>
          </Box>
        </Box>

        {/* Validation Instruction */}
        <Typography sx={{ color: "#475467", fontSize: "14.5px", lineHeight: 1.5, mb: 2.5 }}>
          If you have more than one meter, just enter <strong>one</strong> of your meter numbers for validation.
        </Typography>

        {/* CashPower Meter Number Input */}
        <Controller
          name="meterNumber"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!showError(errors.meterNumber)}>
              <InputLabel
                shrink={meterFocused || Boolean(field.value)}
                sx={{
                  "&:not(.MuiInputLabel-shrink)": { left: "36px" },
                  backgroundColor: "white",
                  px: 0.5,
                }}
              >
                CashPower Meter Number *
              </InputLabel>
              <OutlinedInput
                {...field}
                value={field.value || ""}
                notched={meterFocused || Boolean(field.value)}
                label="CashPower Meter Number *"
                placeholder="Enter CashPower meter number"
                onFocus={() => setMeterFocused(true)}
                onBlur={() => {
                  field.onBlur();
                  setMeterFocused(false);
                }}
                sx={{ backgroundColor: "white" }}
                startAdornment={
                  <Gauge size={20} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
                }
              />
              {showError(errors.meterNumber) && (
                <FormHelperText>{errors.meterNumber?.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Box>
    );
  }

  // 3. VERIFICATION_STATE - Standard Invoice Flow (Image #3)
  return (
    <>
      {/* Verification Question */}
      <Controller
        name="authType"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!showError(errors.authType)}>
            <InputLabel shrink={Boolean(field.value)}>
              Verification Question
            </InputLabel>
            <Select
              {...field}
              notched={Boolean(field.value)}
              label="Verification Question *"
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title={authTooltips[field.value] || ""}
                    placement="top"
                    arrow
                    enterTouchDelay={0}
                    leaveTouchDelay={3000}
                    componentsProps={{ tooltip: { sx: tooltipSx } }}
                  >
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <Question size={20} color="#90caf9" weight="fill" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
            >
              <MenuItem value="last_name">Last Name or Business Name?</MenuItem>
              <MenuItem value="billing_address">Billing Street Name?</MenuItem>
              <MenuItem value="pin">PIN?</MenuItem>
            </Select>
            {showError(errors.authType) && (
              <FormHelperText>{errors.authType?.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Answer */}
      <Controller
        name="authAnswer"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!showError(errors.authAnswer)}>
            <InputLabel
              shrink={answerFocused || Boolean(field.value)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Answer *
            </InputLabel>
            <OutlinedInput
              {...field}
              value={field.value || ""}
              notched={answerFocused || Boolean(field.value)}
              label="Answer *"
              autoComplete="off"
              onFocus={() => setAnswerFocused(true)}
              onBlur={() => {
                field.onBlur();
                setAnswerFocused(false);
              }}
              startAdornment={
                <Lock size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
            />
            {showError(errors.authAnswer) && (
              <FormHelperText>{errors.authAnswer?.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </>
  );
}
