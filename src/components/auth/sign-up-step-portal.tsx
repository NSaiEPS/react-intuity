import * as React from "react";
import { useState } from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Controller, Control, FieldErrors, useWatch } from "react-hook-form";
import { Eye, EyeSlash, Question } from "@phosphor-icons/react";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { RegisterFormData, getPasswordStrength } from "./sign-up-schema";

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
interface StepPortalRegistrationProps {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  showError: (err: unknown) => unknown;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function StepPortalRegistration({ control, errors, showError }: StepPortalRegistrationProps) {
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [show, setShow] = useState({ password: false, confirmPassword: false });

  const toggleVisibility = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  // Watch password here so strength updates live without parent re-renders
  const passwordValue = useWatch({ control, name: "password" });
  const strength = getPasswordStrength(passwordValue);

  return (
    <>
      {/* Username */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!showError(errors.email)}>
            <InputLabel
              shrink={usernameFocused || Boolean(field.value)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Username *
            </InputLabel>
            <OutlinedInput
              {...field}
              notched={usernameFocused || Boolean(field.value)}
              label="Username *"
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => { field.onBlur(); setUsernameFocused(false); }}
              startAdornment={
                <User size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title="Enter your username (e.g., jdoe123) or your email (e.g., jane@email.com). You will use this to log in to your account."
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
            {showError(errors.email) && (
              <FormHelperText>{errors.email?.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Password */}
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!showError(errors.password)}>
            <InputLabel
              shrink={passwordFocused || Boolean(field.value)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Password *
            </InputLabel>
            <OutlinedInput
              {...field}
              notched={passwordFocused || Boolean(field.value)}
              label="Password *"
              type={show.password ? "text" : "password"}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => { field.onBlur(); setPasswordFocused(false); }}
              startAdornment={
                <Lock size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip
                    title="Passwords must be a minimum of 6 characters and must contain at least 1 number. Special characters (!@#$%^&*) are allowed but not required."
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
                  <IconButton onClick={() => toggleVisibility("password")} edge="end">
                    {show.password ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {strength && (
              <Box sx={{ mt: 0.75, px: 0.25 }}>
                <LinearProgress
                  variant="determinate"
                  value={strength.pct}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: strength.color,
                      transition: "width 0.35s ease, background-color 0.35s ease",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: strength.color, fontWeight: 600, mt: 0.25, display: "block" }}
                >
                  {strength.label}
                </Typography>
              </Box>
            )}
            {showError(errors.password) && (
              <FormHelperText>{errors.password?.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Confirm Password */}
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!showError(errors.confirmPassword)}>
            <InputLabel
              shrink={confirmPasswordFocused || Boolean(field.value)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Confirm Password *
            </InputLabel>
            <OutlinedInput
              {...field}
              notched={confirmPasswordFocused || Boolean(field.value)}
              label="Confirm Password *"
              type={show.confirmPassword ? "text" : "password"}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => { field.onBlur(); setConfirmPasswordFocused(false); }}
              startAdornment={
                <Lock size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={() => toggleVisibility("confirmPassword")} edge="end">
                    {show.confirmPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {showError(errors.confirmPassword) && (
              <FormHelperText>{errors.confirmPassword?.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </>
  );
}
