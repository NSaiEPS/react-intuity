import * as React from "react";

import { registerApiRequest } from "@/state/features/accountSlice";
import { colors } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Button } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import { setRouteChecker } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { useState } from "react";
import {
  IconButton,
  InputAdornment,
  LinearProgress,
  OutlinedInput,
  Tooltip,
} from "@mui/material";
import { Eye, EyeSlash, Question } from "@phosphor-icons/react";
import { Helmet } from "react-helmet";

// Schema
const schema = z
  .object({
    name: z.string().min(3, "Enter a valid Name (minimum 3 characters)"),
    accountNumber: z.string().min(1, "Enter a valid Account Number"),
    email: z.string().min(6, "Enter a valid User Name (minimum 6 characters)"),
    password: z
      .string()
      .min(6, "Minimum 6 characters")
      .regex(
        /^(?=.*[0-9]).{6,}$/,
        "Must be at least 6 characters and include 1 number"
      ),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
    authType: z.string().min(1, "Authentication is required"),
    authAnswer: z.string().min(1, "Answer is required"),
    notificationEmail: z.string().email("Enter a valid Email"),
    confirmNotificationEmail: z.string().email("Emails must match"),
    phone: z
      .string()
      .min(14, "Phone number must be at least 10 digits.")
      .or(z.literal("")),
    countryCode: z.string().min(1, "Select a country code"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.notificationEmail === data.confirmNotificationEmail,
    {
      message: "Emails do not match",
      path: ["confirmNotificationEmail"],
    }
  );

type FormData = z.infer<typeof schema>;

interface CustomConnectorProps {
  topOffset?: number;
}

export const CustomConnector = styled(StepConnector, {
  shouldForwardProp: (prop) => prop !== "topOffset",
})<CustomConnectorProps>(({ theme, topOffset = 15 }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: topOffset,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    borderColor: colors["blue.3"],
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: colors.blue,
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#ccc",
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));

const steps = ["Account Info", "Portal Registration", "Contact Info"];

const CustomStepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: ownerState.active ? colors.blue : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 32,
  height: 32,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 500,
  fontSize: 14,
  ...(ownerState.completed && {
    backgroundColor: colors.blue,
  }),
}));

export function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;
  return (
    <CustomStepIconRoot ownerState={{ active, completed }} className={className}>
      {icon}
    </CustomStepIconRoot>
  );
}

export const CustomStepper = ({ activeStep }: { activeStep: number }) => {
  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={<CustomConnector />}
        sx={{
          mb: 4,
          width: "100%",
          [`& .${stepConnectorClasses.line}`]: {
            borderColor: "#ccc",
            borderTopWidth: 2,
            borderRadius: 1,
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

function getPasswordStrength(password = "") {
  if (!password) return null;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  const levels: Record<number, { label: string; color: string; pct: number }> = {
    1: { label: "Weak", color: "#f44336", pct: 20 },
    2: { label: "Fair", color: "#ff9800", pct: 40 },
    3: { label: "Good", color: "#ffc107", pct: 60 },
    4: { label: "Strong", color: "#4caf50", pct: 80 },
    5: { label: "Very Strong", color: "#2e7d32", pct: 100 },
  };
  return levels[score] ?? levels[1];
}

export function SignUpForm() {
  const [activeStep, setActiveStep] = React.useState(0);

  // ─── KEY FIX: only show errors after user clicks Next / Submit ────────────
  const [stepSubmitAttempted, setStepSubmitAttempted] = React.useState(false);

  const location = useLocation();
  const pathname = location.pathname;
  const slugMatch = pathname.startsWith("/register-")
    ? pathname.replace("/register-", "")
    : null;

  const { companyInfo } = useSelector((state: RootState) => state?.Account);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      accountNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      authType: "last_name",
      authAnswer: "",
      notificationEmail: "",
      confirmNotificationEmail: "",
      phone: "",
      countryCode: "1",
    },
  });
const authTooltips = {
  // last_name: "For last name or business name, only enter one primary word ( e.g., The Miller & Sons Manufacturing Group, LLC, only enter Miller). Do NOT enter punctuation (e.g., O’Conner & Sons, only enter Conner)",
  last_name: (
    <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
      For last name or business name, only enter one primary word (e.g.,{" "}
      The Miller &amp; Sons Manufacturing Group, LLC, only enter{" "}
      <strong>Miller</strong>). Do NOT enter punctuation (e.g.,{" "}
      <em>O'Conner &amp; Sons</em>, only enter <strong>Conner</strong>).
    </span>
  ),

  // billingAddress: "Billing Address of your Account Name or Business Name",
  billingAddress: (
    <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
      e.g., 1020 W. Maple Rd., only enter 
     
      <strong> <br/> <em>Maple</em></strong>
    </span>
  ),
  // pin: "Your PIN was sent with your new bill email notice. If you cannot find your PIN, please select one of the other authentication methods.",
  pin: "Your personal identification number (PIN) was sent with your new bill email notice. If you cannot find your PIN, select one of the other verification questions.",
};
  const values = getValues();
console.log(values.authType)
  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ["accountNumber", "authType", "authAnswer"];
      case 1:
        return ["email", "password", "confirmPassword"];
      case 2:
        return [ "notificationEmail", "confirmNotificationEmail", "phone", "countryCode"];
      default:
        return [];
    }
  };

  const [loading, seLoading] = React.useState(false);
  const dispatch = useDispatch();
  const [companyResponse, setCompanyResponse] = React.useState<any>({});

  // Only show error if user has clicked Next/Submit on this step
  const showError = (fieldError: any) => (stepSubmitAttempted ? fieldError : undefined);

  const handleNext = async () => {
    setStepSubmitAttempted(true); // ← unlock error display for this step
    const valid = await trigger(getFieldsForStep(activeStep) as (keyof FormData)[]);
    if (valid) apiCall();
  };

  const apiCall = () => {
    seLoading(true);
    const formData = new FormData();

    if (activeStep == 0) {
      formData.append("account_no", getValues("accountNumber"));
      formData.append("authentication", getValues("authType"));
      formData.append("authentication_field", getValues("authAnswer"));
    }

    if (activeStep == 1) {
      formData.append("user_id", getValues("email"));
      formData.append("password", getValues("password"));
      formData.append("confirm_password", getValues("confirmPassword"));
      formData.append("company_alias", companyInfo?.company?.alias);
      formData.append("customer_id", companyResponse?.customer_id);
    formData.append("acl_role_id", "4");

    }

    if (activeStep == 2) {
      formData.append("name", getValues("name"));
      formData.append("account_no", getValues("accountNumber"));
      formData.append("authentication", getValues("authType"));
      formData.append("authentication_field", getValues("authAnswer"));
      formData.append("user_id", getValues("email"));
      formData.append("password", getValues("password"));
      formData.append("confirm_password", getValues("confirmPassword"));
      formData.append("company_alias", companyInfo?.company?.alias);
      formData.append("email", getValues("notificationEmail"));
      formData.append("confirm_email", getValues("confirmNotificationEmail"));
      formData.append("country_code", getValues("countryCode"));
      formData.append("phone_no", getValues("phone"));
      formData.append("customer_id", companyResponse?.customer_id);
    formData.append("acl_role_id", "4");

    }

    formData.append("company_id", companyInfo?.company?.id);
    formData.append("step", String(activeStep + 1));
    // formData.append("acl_role_id", "4");
    formData.append("page", "1");
//  setStepSubmitAttempted(false);
//  if(activeStep == 2){
//     const alias = companyInfo?.company?.alias;

//       navigate(`/register-success-${alias}`);

//  }
//  else{
//     setActiveStep((prev) => prev + 1);

//  }
//     return
    const alias = companyInfo?.company?.alias;
    dispatch(registerApiRequest(formData, successCallBack, seLoading, alias));
  };

  const successCallBack = (data: any) => {
    if (activeStep == 2) {
      reset(values);
      const alias = companyInfo?.company?.alias;
      // navigate(alias ? `/login-${alias}` : `/login`);


      navigate(`/register-success-${alias}`);
      return;
    }

    // Reset attempt flag when moving to next step — new step starts clean (no errors)
    setStepSubmitAttempted(false);
    setActiveStep((prev) => prev + 1);
    setCompanyResponse({ ...companyResponse, ...data });
    seLoading(false);
  };
console.log(companyResponse,'companyResponse')
  const navigate = useNavigate();

  const handleBack = () => {
    if (activeStep === 0) {
      if (slugMatch) {
        navigate(paths.auth.newLogin(slugMatch));
      } else {
        navigate(paths.auth.newLogin());
      }
      return;
    }
    setStepSubmitAttempted(false); // reset on back too
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = (data: FormData) => {
    apiCall();
  };

  React.useEffect(() => {
    if (isDirty) {
      dispatch(setRouteChecker(true));
    } else {
      dispatch(setRouteChecker(false));
    }
    return () => {
      dispatch(setRouteChecker(false));
    };
  }, [isDirty]);

  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin.includes("hostedpayments.com")) {
        console.log("Payment Result:", event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const [show, setShow] = useState({ password: false, confirmPassword: false });
  const toggleVisibility = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const passwordValue = watch("password");
  const strength = getPasswordStrength(passwordValue);

  return (
    <Box sx={{ maxWidth: 600, margin: "auto" }}>
      <Helmet key={"Register"}>
        <title>{"Register"}</title>
      </Helmet>

      <CustomStepper activeStep={activeStep} />

      {activeStep !== 2 ? (
        <Typography variant="body1" mb={4}>
          Please enter your information into the fields below and click NEXT to
          continue creating your account.
        </Typography>
      ):
      <Typography variant="body1" mb={4}>
       Please enter your email address and mobile phone number. If you do not have a mobile phone then leave it blank.
        </Typography>
      }

      <Typography variant="h6" sx={{ mb: 2, color: colors.blue }}>
        {steps[activeStep]}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>

          {/* ─── Step 0: Account Info + Authentication ───────────────────────── */}
          {activeStep === 0 && (
            <>
              <Controller
                name="accountNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Account Number *"
                    fullWidth
                    {...field}
                    error={!!showError(errors.accountNumber)}
                    helperText={showError(errors.accountNumber)?.message}
                  />
                )}
              />

              <Controller
                name="authType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!showError(errors.authType)}>
                    <InputLabel>Verification Question  *</InputLabel>
                    <Select
                      label="Verification Question  *"
                      sx={{ paddingRight: "40px" }}
                      {...field}
                       value={field.value || ""}
                         onChange={(e) => {
    field.onChange(e.target.value); // 👈 MUST
    console.log("Selected:", e.target.value); // debug
  }}
                      endAdornment={
                        <InputAdornment position="end">
                          <Tooltip
//                             title={
//                               values.authType=='last_name'?'Last Name of your Account Name or Business Name':
//                               values.authType=='billingAddress'?'Billing Address of your Account Name or Business Name':
//                               values.authType=='pin'?
//                               "Your PIN was sent with your new bill email notice. If you cannot find your PIN, please select one of the other authentication methods."
// :
                              
//                               "Your PIN was sent with your new bill email notice. If you cannot find your PIN, please select one of the other authentication methods."
//                              } 
title={authTooltips[field.value] || ""}
                             placement="top"
                            arrow
                              enterTouchDelay={0} // 👈 show immediately on tap
  leaveTouchDelay={3000} // 👈 stays visible for 3s
   componentsProps={{
    tooltip: {
      sx: {
        backgroundColor: '#E7E6E6',
        color: '#000000',
        border: '1px solid #d0cfcf',
           fontSize: '14px',        // 👈 updated
      lineHeight: 1.4,
        // fontSize: '0.8rem',
        '& .MuiTooltip-arrow': {
          color: '#E7E6E6',
          '&::before': {
            border: '1px solid #d0cfcf',
          },
        },
      },
    },
  }}
                          >
                            <IconButton size="small" edge="end">
                              <Question size={20} color="#90caf9" weight="fill" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="last_name">Last Name or Business Name?</MenuItem>
                      <MenuItem value="billingAddress">Billing Street Name?</MenuItem>
                      <MenuItem value="pin">PIN?</MenuItem>
                    </Select>
                    {showError(errors.authType) && (
                      <FormHelperText>{errors.authType?.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="authAnswer"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Answer *"
                    fullWidth
                    {...field}
                    error={!!showError(errors.authAnswer)}
                    helperText={showError(errors.authAnswer)?.message}
                  />
                )}
              />
            </>
          )}

          {/* ─── Step 1: Portal Registration ─────────────────────────────────── */}
          {activeStep === 1 && (
            <>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="User Name *"
                    fullWidth
                    {...field}
                    error={!!showError(errors.email)}
                    helperText={showError(errors.email)?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip
                            // title="This ID or email is what you will use to log in to your account."
                            title="Enter your username (e.g., jdoe123) or your email (e.g., jane@email.com). You will use this to log in to your account. "
                            placement="top"
                            arrow
                              enterTouchDelay={0} // 👈 show immediately on tap
  leaveTouchDelay={3000} // 👈 stays visible for 3s
     componentsProps={{
    tooltip: {
      sx: {
        backgroundColor: '#E7E6E6',
        color: '#000000',
        border: '1px solid #d0cfcf',
           fontSize: '14px',        // 👈 updated
      lineHeight: 1.4,
        // fontSize: '0.8rem',
        '& .MuiTooltip-arrow': {
          color: '#E7E6E6',
          '&::before': {
            border: '1px solid #d0cfcf',
          },
        },
      },
    },
  }}
                          >
                            <IconButton size="small" edge="end">
                              <Question size={20} color="#90caf9" weight="fill" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!showError(errors.password)}>
                    <InputLabel shrink={!!field.value}>Password *</InputLabel>
                    <OutlinedInput
                      label="Password *"
                      notched={!!field.value}
                      type={show.password ? "text" : "password"}
                      {...field}
                      endAdornment={
                        <InputAdornment position="end">
                          <Tooltip
                            title="Passwords must be a minimum of 6 characters and must contain at least 1 number. Special characters (!@#$%^&*) are allowed but not required."
                            placement="top"
                            arrow
                              enterTouchDelay={0} // 👈 show immediately on tap
  leaveTouchDelay={3000} // 👈 stays visible for 3s
     componentsProps={{
    tooltip: {
      sx: {
        backgroundColor: '#E7E6E6',
        color: '#000000',
        border: '1px solid #d0cfcf',
           fontSize: '14px',        // 👈 updated
      lineHeight: 1.4,
        // fontSize: '0.8rem',
        '& .MuiTooltip-arrow': {
          color: '#E7E6E6',
          '&::before': {
            border: '1px solid #d0cfcf',
          },
        },
      },
    },
  }}
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

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!showError(errors.confirmPassword)}>
                    <InputLabel shrink={!!field.value}>Confirm Password *</InputLabel>
                    <OutlinedInput
                      label="Confirm Password *"
                      notched={!!field.value}
                      type={show.confirmPassword ? "text" : "password"}
                      {...field}
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
          )}

          {/* ─── Step 2: Contact Info ─────────────────────────────────────────── */}
          {activeStep === 2 && (
            <>
              {/* <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Name *"
                    fullWidth
                    {...field}
                    error={!!showError(errors.name)}
                    helperText={showError(errors.name)?.message}
                  />
                )}
              /> */}
      <Typography variant="body1" >
      Account Number : {companyResponse?.account_no}
        </Typography>
              <Typography variant="body1" mb={1}>
      Customer Name &nbsp;: {companyResponse?.customer_name}

        </Typography>
              <Controller
                name="notificationEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Notification Email *"
                    fullWidth
                    {...field}
                    error={!!showError(errors.notificationEmail)}
                    helperText={showError(errors.notificationEmail)?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip
                            title="This email is where you will receive notifications and may be the same as a login email."
                            placement="top"
                            arrow
                                enterTouchDelay={0} // 👈 show immediately on tap
  leaveTouchDelay={3000} // 👈 stays visible for 3s
    componentsProps={{
    tooltip: {
      sx: {
        backgroundColor: '#E7E6E6',
        color: '#000000',
        border: '1px solid #d0cfcf',
           fontSize: '14px',        // 👈 updated
      lineHeight: 1.4,
        // fontSize: '0.8rem',
        '& .MuiTooltip-arrow': {
          color: '#E7E6E6',
          '&::before': {
            border: '1px solid #d0cfcf',
          },
        },
      },
    },
  }}
                          >
                            <IconButton size="small" edge="end">
                              <Question size={20} color="#90caf9" weight="fill" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="confirmNotificationEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Confirm Notification Email *"
                    fullWidth
                    {...field}
                    error={!!showError(errors.confirmNotificationEmail)}
                    helperText={showError(errors.confirmNotificationEmail)?.message}
                  />
                )}
              />

              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Controller
                  name="countryCode"
                  control={control}
                  render={({ field }) => (
                    <FormControl error={!!showError(errors.countryCode)} sx={{ minWidth: 160 }}>
                      <InputLabel>Country</InputLabel>
                      <Select label="Country" {...field}>
                        <MenuItem value="1">1 - United States</MenuItem>
                        <MenuItem value="91">91 - India</MenuItem>
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
                  render={({ field }) => {
                    const formatUS = (value: string) => {
                      const digits = value.replace(/\D/g, "").slice(0, 10);
                      if (digits.length < 4) return digits;
                      if (digits.length < 7)
                        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
                    };
                    return (
                      <TextField
                        label="Phone No"
                        fullWidth
                        {...field}
                        value={formatUS(field.value || "")}
                        onChange={(e) => field.onChange(formatUS(e.target.value))}
                        error={!!showError(errors.phone)}
                        helperText={showError(errors.phone)?.message}
                        placeholder="(555) 000-0000"
                        inputProps={{ maxLength: 14 }}
                      />
                    );
                  }}
                />
              </Stack>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {activeStep === 2 && (
            <Typography variant="body1" fontWeight="bold" mb={2}>
              {/* Please enter your information into the fields below and click SUBMIT.
              You will receive an email confirmation with a link to finish creating
              your account. */}
              After selecting Submit, you will receive an email confirmation with a link to activate your account.
            </Typography>
          )}

          <Stack direction="row" justifyContent="space-between">
            <Button
              onClick={handleBack}
              variant="outlined"
              textTransform="none"
              disabled={loading}
              style={{
                color: colors.blue,
                borderColor: colors.blue,
                borderRadius: "12px",
                height: "41px",
              }}
            >
              Back
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                variant="contained"
                textTransform="none"
                bgColor={colors.blue}
                hoverBackgroundColor={colors["blue.3"]}
                hoverColor="white"
                style={{ borderRadius: "12px", height: "41px" }}
              >
                Next
              </Button>
            ) : (
              <Button
                loading={loading}
                disabled={loading}
                onClick={handleNext}        // ← same flow as Next, not type="submit"
                variant="contained"
                textTransform="none"
                bgColor={colors.blue}
                hoverBackgroundColor={colors["blue.3"]}
                hoverColor="white"
                style={{ borderRadius: "12px", height: "41px" }}
              >
                Submit
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}