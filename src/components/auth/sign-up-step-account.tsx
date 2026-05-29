import * as React from "react";
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { CreditCard } from "@phosphor-icons/react/dist/ssr/CreditCard";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";
import { Question } from "@phosphor-icons/react";
import { RegisterFormData } from "./sign-up-schema";

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

const tooltipSx = {
  backgroundColor: "#E7E6E6",
  color: "#000",
  border: "1px solid #d0cfcf",
  fontSize: "14px",
  lineHeight: 1.4,
  "& .MuiTooltip-arrow": {
    color: "#E7E6E6",
    "&::before": { border: "1px solid #d0cfcf" },
  },
};

// ─── Props ─────────────────────────────────────────────────────────────────────
interface StepAccountInfoProps {
  control: Control<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  showError: (err: unknown) => unknown;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function StepAccountInfo({ control, errors, showError }: StepAccountInfoProps) {
  const [accountFocused, setAccountFocused] = React.useState(false);
  const [answerFocused, setAnswerFocused] = React.useState(false);

  return (
    <>
      {/* Account Number */}
      <Controller
        name="accountNumber"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!showError(errors.accountNumber)}>
            <InputLabel
              shrink={accountFocused || Boolean(field.value)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Account Number *
            </InputLabel>
            <OutlinedInput
              {...field}
              notched={accountFocused || Boolean(field.value)}
              label="Account Number *"
              onFocus={() => setAccountFocused(true)}
              onBlur={() => { field.onBlur(); setAccountFocused(false); }}
              startAdornment={
                <CreditCard size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
              // endAdornment={
              //   <InputAdornment position="end">
              //     <Tooltip
              //       title={
              //         <img
              //           src="/assets/bankaccount-help.png"
              //           alt="Help"
              //           style={{ width: 1000, maxWidth: "100%", borderRadius: 8 }}
              //         />
              //       }
              //       placement="top"
              //       arrow
              //       enterTouchDelay={0}
              //       leaveTouchDelay={3000}
              //       componentsProps={{ tooltip: { sx: tooltipSx } }}
              //     >
              //       <IconButton size="small" sx={{ mr: 1 }}>
              //         <Question size={20} color="#90caf9" weight="fill" />
              //       </IconButton>
              //     </Tooltip>
              //   </InputAdornment>
              // }
                  endAdornment={
                            <InputAdornment position="end">
                              {/* <Tooltip
                                title={
                                  <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
                                    Please locate your account number on your statement. If you received a ‘Utility Bill Ready’ email notification, your account number can be found at the top of the email content.
                                  </span>
                                }
                                placement="top"
                                arrow
                                {...tooltipSx}
                              >
                                <IconButton edge="end" size="small">
                                  <Question size={20} color="#5dade2" weight="fill" />
                                </IconButton>
                              </Tooltip> */}

                                 <Tooltip
   title={
                                  <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
                                    Please locate your account number on your statement. If you received a ‘Utility Bill Ready’ email notification, your account number can be found at the top of the email content.
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
            {showError(errors.accountNumber) && (
              <FormHelperText>{errors.accountNumber?.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

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
              notched={answerFocused || Boolean(field.value)}
              label="Answer *"
              onFocus={() => setAnswerFocused(true)}
              onBlur={() => { field.onBlur(); setAnswerFocused(false); }}
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
