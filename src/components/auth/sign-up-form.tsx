import * as React from "react";

import { registerApiRequest } from "@/state/features/accountSlice";
import { colors, dummyCountriesList } from "@/utils";
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

  Tooltip,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Eye, EyeSlash, Question } from "@phosphor-icons/react";
import { Helmet } from "react-helmet";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Lock } from "@phosphor-icons/react/dist/ssr/Lock";

import { CreditCard } from "@phosphor-icons/react/dist/ssr/CreditCard";
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

const steps = ["Account Info", "Portal Registration", "Contact Info",'Check Your Email'
];

const CustomStepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ ownerState }) => ({
  backgroundColor: ownerState.active ? colors.blue : "#ccc",
  color: "#fff",
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 500,

  width: "32px",
  height: "32px",
  fontSize: "14px",

  "@media (max-width:380px)": {
    width: "26px",
    height: "26px",
    fontSize: "12px",
  },

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

// export const CustomStepper = ({ activeStep }: { activeStep: number }) => {
//   return (
//     <Box display="flex" justifyContent="center" width="100%">
//       <Stepper
//         activeStep={activeStep}
//         alternativeLabel
//         connector={<CustomConnector />}
//         sx={{
//           mb: 4,
//           width: "100%",
//           [`& .${stepConnectorClasses.line}`]: {
//             borderColor: "#ccc",
//             borderTopWidth: 2,
//             borderRadius: 1,
//           },
//         }}
//       >
//         {steps.map((label) => (
//           <Step key={label}>
//             <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>
//     </Box>
//   );
// };


// 1. Hide step 4 from stepper — only show first 3


export const CustomStepper = ({ activeStep }: { activeStep: number }) => {
  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={<CustomConnector topOffset={14} />}
        sx={{
          mb: 4,
          width: "100%",
          px: { xs: 0.5, sm: 1 },

          "& .MuiStep-root": {
            px: { xs: 0.2, sm: 1 },
          },

          "& .MuiStepLabel-label": {
            mt: 1,
            fontSize: {
              xs: "0.72rem",
              sm: "0.85rem",
            },
            lineHeight: 1.25,
            whiteSpace: "normal",
            textAlign: "center",
            maxWidth: {
              xs: "70px",
              sm: "120px",
            },
            wordBreak: "break-word",
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>
              {label}
            </StepLabel>
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
    dispatch(registerApiRequest(formData, successCallBack, seLoading, alias,activeStep));
  };

  const successCallBack = (data: any) => {
    if (activeStep == 2) {
      reset(values);
      const alias = companyInfo?.company?.alias;
      // navigate(alias ? `/login-${alias}` : `/login`);


      // navigate(`/register-success-${alias}`);
    setActiveStep((prev) => prev + 1);


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


    const handleBackToLogin = () => {
      const alias = companyInfo?.company?.alias;

    if (alias) {
      navigate(paths.auth.newLogin(alias));
    } else {
      navigate(paths.auth.newLogin());
    }
  };

  const [accountFocused, setAccountFocused] = React.useState(false);
const [answerFocused, setAnswerFocused] = React.useState(false);
const [usernameFocused, setUsernameFocused] = React.useState(false);
const [passwordFocused, setPasswordFocused] = React.useState(false);
const [confirmPasswordFocused, setConfirmPasswordFocused] = React.useState(false);
const [notifEmailFocused, setNotifEmailFocused] = React.useState(false);
const [confirmNotifEmailFocused, setConfirmNotifEmailFocused] = React.useState(false);
const [phoneFocused, setPhoneFocused] = React.useState(false);
  return (
    <Box >
      <Helmet key={"Register"}>
        <title>{"Register"}</title>
      </Helmet>

      <CustomStepper activeStep={activeStep} />

    
{activeStep !== 3 && (
  <>
    {/* Icon + Title header */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 5 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          backgroundColor: "#e8f0fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <User size={36} color={colors.blue} weight="regular" />
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={0.5}
        sx={{
          color: colors.blue
        }}
        >
          {/* Let's create your account */}
      {steps[activeStep]}

        </Typography>
        <Typography variant="body2" color="text.secondary">
          {activeStep === 2
            // ? "Please enter your email address and phone number."
            ? ""
            // : "Please enter your information into the fields below and click NEXT to continue creating your account."}
            : ""}
        </Typography>
      </Box>
    </Box>

  
  </>
)}
  

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>

          {/* ─── Step 0: Account Info + Authentication ───────────────────────── */}
    
{activeStep === 0 && (
  <>
    <Controller
      name="accountNumber"
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={!!showError(errors.accountNumber)}>
          <InputLabel
            shrink={accountFocused || Boolean(field.value)}
            sx={{
              "&:not(.MuiInputLabel-shrink)": { left: "36px" },
            }}
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
             endAdornment={
              <InputAdornment position="end">
                <Tooltip
                  // title={authTooltips[field.value] || ""}
                    title={
    <img
      src="/assets/bankaccount-help.png"
      alt="Help"
      style={{
        width: 1000,
        maxWidth: "100%",
        borderRadius: 8,
      }}
    />
  }
                  placement="top"
                  arrow
                  enterTouchDelay={0}
                  leaveTouchDelay={3000}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "#E7E6E6",
                        color: "#000",
                        border: "1px solid #d0cfcf",
                        fontSize: "14px",
                        lineHeight: 1.4,
                        "& .MuiTooltip-arrow": {
                          color: "#E7E6E6",
                          "&::before": { border: "1px solid #d0cfcf" },
                        },
                      },
                    },
                  }}
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

    <Controller
      name="authType"
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={!!showError(errors.authType)}>
          <InputLabel shrink={Boolean(field.value)}>
            Verification Question 
            {/* <span style={{ color: "red" }}>*</span> */}
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
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "#E7E6E6",
                        color: "#000",
                        border: "1px solid #d0cfcf",
                        fontSize: "14px",
                        lineHeight: 1.4,
                        "& .MuiTooltip-arrow": {
                          color: "#E7E6E6",
                          "&::before": { border: "1px solid #d0cfcf" },
                        },
                      },
                    },
                  }}
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

    <Controller
      name="authAnswer"
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={!!showError(errors.authAnswer)}>
          <InputLabel
            shrink={answerFocused || Boolean(field.value)}
            sx={{
              "&:not(.MuiInputLabel-shrink)": { left: "36px" },
            }}
          >
            Answer *
            {/* <span style={{ color: "red" }}>*</span> */}
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
)}

          {/* ─── Step 1: Portal Registration ─────────────────────────────────── */}
         {activeStep === 1 && (
  <>
    <Controller
      name="email"
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={!!showError(errors.email)}>
          <InputLabel
            shrink={usernameFocused || Boolean(field.value)}
            sx={{
              "&:not(.MuiInputLabel-shrink)": { left: "36px" },
            }}
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
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "#E7E6E6",
                        color: "#000000",
                        border: "1px solid #d0cfcf",
                        fontSize: "14px",
                        lineHeight: 1.4,
                        "& .MuiTooltip-arrow": {
                          color: "#E7E6E6",
                          "&::before": { border: "1px solid #d0cfcf" },
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
          />
          {showError(errors.email) && (
            <FormHelperText>{errors.email?.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />

    <Controller
      name="password"
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={!!showError(errors.password)}>
          <InputLabel
            shrink={passwordFocused || Boolean(field.value)}
            sx={{
              "&:not(.MuiInputLabel-shrink)": { left: "36px" },
            }}
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
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "#E7E6E6",
                        color: "#000000",
                        border: "1px solid #d0cfcf",
                        fontSize: "14px",
                        lineHeight: 1.4,
                        "& .MuiTooltip-arrow": {
                          color: "#E7E6E6",
                          "&::before": { border: "1px solid #d0cfcf" },
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
          <InputLabel
            shrink={confirmPasswordFocused || Boolean(field.value)}
            sx={{
              "&:not(.MuiInputLabel-shrink)": { left: "36px" },
            }}
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
)}

          {/* ─── Step 2: Contact Info ─────────────────────────────────────────── */}
         {activeStep === 2 && (
  <>
    {/* Account info display */}
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
                  title="This email is where you will receive notifications and may be the same as a login email."
                  placement="top"
                  arrow
                  enterTouchDelay={0}
                  leaveTouchDelay={3000}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "#E7E6E6",
                        color: "#000000",
                        border: "1px solid #d0cfcf",
                        fontSize: "14px",
                        lineHeight: 1.4,
                        "& .MuiTooltip-arrow": {
                          color: "#E7E6E6",
                          "&::before": { border: "1px solid #d0cfcf" },
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

    {/* Country + Phone row */}
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Controller
        name="countryCode"
        control={control}
        render={({ field }) => (
          <FormControl error={!!showError(errors.countryCode)} sx={{ minWidth: 160 }}>
            <InputLabel shrink={Boolean(field.value)}>Country</InputLabel>
            <Select
              {...field}
              notched={Boolean(field.value)}
              label="Country"
            >
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
        render={({ field }) => {
          const formatUS = (value: string) => {
            const digits = value.replace(/\D/g, "").slice(0, 10);
            if (digits.length < 4) return digits;
            if (digits.length < 7)
              return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
          };
          return (
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
          );
        }}
      />
    </Stack>
  </>
)}
          {
            activeStep==3&&
             <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="50vh"
                  textAlign="center"
                //   gap={2}
                //   px={3}
                >
                  <Helmet key={"Register Success"}>
                    <title>Registration Successful</title>
                  </Helmet>
            
                  <CheckCircle size={80} weight="fill" color="#2e7d32" />
            
                  <Typography variant="h5" fontWeight={600} mt={1}>
                   Registration Almost Complete
                  </Typography>
            
                <Typography
              variant="body1"
              color="text.primary"
              sx={{ 
                maxWidth: 460, 
                lineHeight: 1.7,
                backgroundColor: '#FFF9C4',
                color: '#000000',
                padding: '10px 14px',
                borderRadius: '6px',
                my:2
              }}
            >
Please check your email inbox and click the activation link to complete your account setup.
            </Typography>
            
                  <Button
                    onClick={handleBackToLogin}
                    variant="contained"
                    textTransform="none"
                    bgColor={colors.blue}
                    hoverBackgroundColor={colors["blue.3"]}
                    hoverColor="white"
                    style={{ borderRadius: "12px", height: "41px", marginTop: "8px", minWidth: "160px" }}
                  >
                    {`← `}   Back to Login
                  </Button>
                </Box>
          }

          {/* <Divider sx={{ my: 2 }} /> */}

          {/* {activeStep === 2 && (
            <Typography variant="body1" fontWeight="bold" mb={2}> */}
              {/* Please enter your information into the fields below and click SUBMIT.
              You will receive an email confirmation with a link to finish creating
              your account. */}
              {/* After selecting Submit, you will receive an email confirmation with a link to activate your account.
            </Typography>
          )} */}
{
  activeStep !== 3&&

      // 4. Back / Next buttons with arrows
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
      height: "44px",
      width:activeStep==0? "auto":'110px',
      backgroundColor: "white",
      fontWeight: 600,
      
    }}
  >

      {activeStep==0?
      `←  Back to Login `:
    
    `← Back`}
  </Button>

  {activeStep < steps.length ? (
    <Button
      onClick={handleNext}
      disabled={loading}
      variant="contained"
      textTransform="none"
      bgColor={colors.blue}
      hoverBackgroundColor={colors["blue.3"]}
      hoverColor="white"
      style={{ borderRadius: "12px", height: "44px", width: "110px", fontWeight: 600 }}
    >
      {activeStep === steps.length - 1 ? "Submit" : "Next"} {` `} {` →`}
    </Button>
  ) : null}
</Stack>
          
          }
        </Stack>
      </form>
    </Box>
  );
}