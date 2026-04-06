import * as React from "react";

import { registerApiRequest } from "@/state/features/accountSlice";
import { colors } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  // Button,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  // Stepper,
  // Step,
  // StepLabel,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Check } from "@phosphor-icons/react/dist/ssr";
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
  InputAdornment, LinearProgress,
  OutlinedInput, Tooltip,
} from "@mui/material";
import { Eye, EyeSlash, Question } from "@phosphor-icons/react";
import { Helmet } from "react-helmet";

// Schema
const schema = z
  .object({
    // name: z.string().min(3, "Name is required, at least 3 characters needed"),
    // accountNumber: z.string().min(3, "Account Number is required, at least 3 characters needed"),
        name: z.string().min(3, 'Enter a valid Name (minimum 3 characters)'),
    accountNumber: z.string().min(4, "Enter a valid Account Number (minimum 4 characters)"),
    // email: z.string().email("Invalid email"),
    email: z.string().min(6, "Enter a valid Login ID or Email (minimum 6 characters)"),
password: z.string()
  .min(6, "Minimum 6 characters")
  .regex(/^(?=.*[0-9]).{6,}$/, "Must be at least 6 characters and include 1 number"),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
    authType: z.string().min(1, "Authentication is required"),
    authAnswer: z.string().min(1, "Answer is required"),
    notificationEmail: z.string().email("Enter a valid  Email"),
    confirmNotificationEmail: z.string().email("Emails must match"),
    // phone: z.string().min(10, "Phone number required"),
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
  .refine((data) => data.notificationEmail === data.confirmNotificationEmail, {
    message: "Emails do not match",
    path: ["confirmNotificationEmail"],
  });

type FormData = z.infer<typeof schema>;

const customColor = colors.blue;

// const CustomConnector = styled(StepConnector)(({ theme }) => ({
//   [`.${stepConnectorClasses.alternativeLabel}`]: {
//     top: 16,
//     left: 'calc(-50% + 20px)',
//     right: 'calc(50% + 20px)',
//   },
//   '&.first-connector': {
//     left: 'calc(-50% + 22px)', // try tuning this
//     right: 'calc(50% + 18px)',
//   },
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       backgroundColor: customColor,
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 2,
//     border: 0,
//     backgroundColor: theme.palette.grey[300],
//   },
// }));

// const CustomConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.alternativeLabel}`]: {
//     top: 16,
//     left: "-70px",
//     right: "20px",
//     marginLeft: "500px",
//   },
//   // 👇 This targets the first step connector visually (the one after Step 1)
//   // [`&:nth-of-type(2).${stepConnectorClasses.alternativeLabel}`]: {
//   //   left: 'calc(50% + 2px)', // pushes line away from the circle
//   // },
//   [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
//     backgroundColor: customColor,
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     height: 2,
//     border: 0,
//     backgroundColor: theme.palette.grey[300],
//   },
// }));

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
    borderColor: colors["blue.3"], // active step
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    borderColor: colors.blue, // completed steps
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#ccc",
    borderTopWidth: 2,
    borderRadius: 1,
  },
}));
// const CustomStepIcon = ({ active, completed, icon }) => {
//   return (
//     <div
//       style={{
//         backgroundColor: active || completed ? customColor : "#ccc",
//         color: "#fff",
//         borderRadius: "50%",
//         width: 32,
//         height: 32,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontWeight: "bold",
//       }}
//     >
//       {/* {completed ? icon : icon} */}
//       {completed ? <Check size={20} weight="bold" /> : icon}
//     </div>
//   );
// };

// Example usage
 const steps = [
    "Account Info",
    // "Authentication",
    "Confirm Account Info ",
    "Portal Registration",
    "Contact Info",
  ];
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
    <CustomStepIconRoot
      ownerState={{ active, completed }}
      className={className}
    >
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
          // maxWidth: 700,
          // marginX: "auto",
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

export function SignUpForm() {
  const [activeStep, setActiveStep] = React.useState(0);
  // const router = useRouter();
  const location = useLocation();
const pathname = location.pathname;

const slugMatch =
  pathname.startsWith("/register-")
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
    //  mode: "onTouched",
      mode: "onChange",           // ✅ show error after field is blurred
  reValidateMode: "onChange",
    defaultValues: {
      name: "",
      accountNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      authType: "",
      authAnswer: "",
      notificationEmail: "",
      confirmNotificationEmail: "",
      phone: "",
      countryCode: "1",
    },
  });
const values = getValues();

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ["name", "accountNumber"];
      case 1:
        return ["authType", "authAnswer"];
      case 2:
        return ["email", "password", "confirmPassword"];
      case 3:
        return [
          "notificationEmail",
          "confirmNotificationEmail",
          "phone",
          "countryCode",
        ];
      default:
        return [];
    }
  };
  const [loading, seLoading] = React.useState(false);
  const handleNext = async () => {
    // const valid = await trigger(getFieldsForStep(activeStep));
    const valid = await trigger(
      getFieldsForStep(activeStep) as (keyof FormData)[]
    );

    // if (valid) setActiveStep((prev) => prev + 1);
    if (valid) apiCall();
  };
  const dispatch = useDispatch();
  const [companyResponse, setCompanyResponse] = React.useState<any>({});
  console.log(companyResponse,'companyResponse')
  const apiCall = () => {
    seLoading(true);

    const formData = new FormData();

    if (activeStep == 0) {
      formData.append("name", getValues("name"));
      formData.append("account_no", getValues("accountNumber"));
    }
    if (activeStep == 1) {
      formData.append("authentication", getValues("authType"));
      formData.append("authentication_field", getValues("authAnswer"));
      formData.append("customer_id", companyResponse?.customer_id);
    }

    if (activeStep == 2) {
      formData.append("user_id", getValues("email"));
      formData.append("password", getValues("password"));
      formData.append("confirm_password", getValues("confirmPassword"));
      formData.append("company_alias", companyInfo?.company?.alias);

      formData.append("customer_id", companyResponse?.customer_id);
    }

    if (activeStep == 3) {
      formData.append("name", getValues("name"));
      formData.append("account_no", getValues("accountNumber"));
      formData.append("authentication", getValues("authType"));
      formData.append("authentication_field", getValues("authAnswer"));

      formData.append("user_id", getValues("email"));
      formData.append("password", getValues("password"));
      formData.append("confirm_password", getValues("confirmPassword"));
      formData.append("company_alias", companyInfo?.company?.alias);
      formData.append("user_id", getValues("email"));
      formData.append("password", getValues("password"));
      formData.append("confirm_password", getValues("confirmPassword"));
      // formData.append('company_alias', companyResponse?.company_alias);
      formData.append("email", getValues("notificationEmail"));
      formData.append("confirm_email", getValues("confirmNotificationEmail"));
      formData.append("country_code", getValues("countryCode"));
      formData.append("phone_no", getValues("phone"));

      formData.append("customer_id", companyResponse?.customer_id);
    }

    formData.append("company_id", companyInfo?.company?.id);

    formData.append("step", String(activeStep + 1));
    formData.append("acl_role_id", "4");
    formData.append("page", "1");

    //     user_id:holiday@gmail.com
    // password:holiday@123
    // confirm_password:holiday@123
    // company_id:2
    // customer_id:16405
    // step:3
    // acl_role_id:4
    // page:1
    // company_alias:cape-royale1

    //     name:Holiday Inn
    // account_number:0003.01
    // authentication:last_name
    // authentication_field:Inn
    // company_id:2
    // customer_id:16405
    // user_id:holiday@gmail.com
    // acl_role_id:4
    // page:1
    // company_alias:cape-royale1
    // password:holiday@123
    // confirm_password:holiday@123
    // email:holiday@gmail.com
    // confirm_email:holiday@gmail.com
    // country_code:1
    // phone_no:(949) 200-8103
    // page:1
const alias= companyInfo?.company?.alias;
    dispatch(registerApiRequest(formData, successCallBack, seLoading,alias));
  }
  console.log(activeStep,'activeStep')
  const successCallBack = (data:any) => {

       if (activeStep == 3) {
        reset(values);
const alias= companyInfo?.company?.alias;
      
      // window.location.href = "/intuityfe/auth/sign-in";
   navigate(alias ? `/login-${alias}` : `/login`);

      

        return
    }

     if (activeStep === 0) {
    reset({ ...getValues(), authType: "lastName" });
  }
    setActiveStep((prev) => prev + 1);
    setCompanyResponse({ ...companyResponse, ...data });
    seLoading(false);
 
  };
  const navigate = useNavigate();

  const handleBack = () => {
    if (activeStep === 0) {
      // Redirect to login if on the first step
      // window.location.href = '/intuityfe/auth/sign-in';
 if (slugMatch) {
      // slug register → slug login
      navigate(paths.auth.newLogin(slugMatch));
    } else {
      navigate(paths.auth.newLogin());
    }

      return;
    }
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = (data: FormData) => {
    apiCall();
    // API call here
  };

  React.useEffect(() => {

    if (isDirty) {
      dispatch(setRouteChecker(true));

    }
    else{
      dispatch(setRouteChecker(false));

    }
    return () => {
      dispatch(setRouteChecker(false));
    }
  }, [isDirty]);

  React.useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from Worldpay’s domain
      if (event.origin.includes("hostedpayments.com")) {
        console.log("Payment Result:", event.data);
        // parse event.data here
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);


  React.useEffect(() => {

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        // Show confirmation dialog
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message; // Some browsers require this for custom messages
        return message; // For some older browsers
      }
      // Clean up builder data only if there are no unsaved changes
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty,]);


const stepFieldsMap: Record<number, Partial<FormData>> = {
  0: {
    name: "",
    accountNumber: "",
  },
  1: {
    authType: "",
    authAnswer: "",
  },
  2: {
    email: "",
    password: "",
    confirmPassword: "",
  },
  3: {
    notificationEmail: "",
    confirmNotificationEmail: "",
    countryCode: "",
    phone: "",
  },
};

const handleCancel = () => {
  const currentValues = getValues(); // ✅ get all existing values

  reset({
    ...currentValues, // ✅ keep previous steps data
    ...stepFieldsMap[activeStep], // ✅ clear only current step
  });
};



  // ─── State (add near your other useState hooks) ───────────────────────────────
const [show, setShow] = useState({ password: false, confirmPassword: false });
const toggleVisibility = (field: keyof typeof show) =>
  setShow((prev) => ({ ...prev, [field]: !prev[field] }));

// ─── Strength helper (outside component or in utils) ──────────────────────────
// function getPasswordStrength(password = "") {
//   if (!password) return null;
//   let score = 0;
//   if (password.length >= 6)            score++;
//   if (password.length >= 10)           score++;
//   if (/[A-Z]/.test(password))          score++;
//   if (/[0-9]/.test(password))          score++;
//   if (/[!@#$%^&*]/.test(password))     score++;

//   const levels = [
//     { score: 1, label: "Weak",        color: "#f44336", pct: 20 },
//     { score: 2, label: "Fair",        color: "#ff9800", pct: 40 },
//     { score: 3, label: "Good",        color: "#ffc107", pct: 60 },
//     { score: 4, label: "Strong",      color: "#4caf50", pct: 80 },
//     { score: 5, label: "Very Strong", color: "#2e7d32", pct: 100 },
//   ];
//   return levels[Math.min(score, 5) - 1] ?? levels[0];
// }

function getPasswordStrength(password = "") {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6)         score++;  // baseline length
  if (password.length >= 10)        score++;  // longer = better
  if (/[A-Z]/.test(password))       score++;  // uppercase
  if (/[0-9]/.test(password))       score++;  // number
  if (/[!@#$%^&*]/.test(password))  score++;  // special char

  // score 0 → caught by !password guard above, won't reach here
  // score 1–5 → map directly
  const levels: Record<number, { label: string; color: string; pct: number }> = {
    1: { label: "Weak",        color: "#f44336", pct: 20  },
    2: { label: "Fair",        color: "#ff9800", pct: 40  },
    3: { label: "Good",        color: "#ffc107", pct: 60  },
    4: { label: "Strong",      color: "#4caf50", pct: 80  },
    5: { label: "Very Strong", color: "#2e7d32", pct: 100 },
  };

  return levels[score] ?? levels[1];
}
const passwordValue = watch("password");
const strength = getPasswordStrength(passwordValue);
  return (

    <Box sx={{ maxWidth: 600, margin: "auto" }}>
    <Helmet key={'Register'}>
           <title>{'Register'}</title>
         </Helmet>
      <CustomStepper activeStep={activeStep} />

{activeStep!==3 && 

 <Typography variant="body1"  mb={4}>
Please enter your information into the fields below and click NEXT to continue creating your account.          </Typography>
}

      <Typography variant="h6" sx={{ mb: 2, color: colors.blue }}>
        {steps[activeStep]}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {activeStep === 0 && (
            <>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Name *"
                    fullWidth
                    {...field}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="accountNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Account Number *"
                    fullWidth
                    {...field}
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber?.message}
                  />
                )}
              />
            </>
          )}

          {activeStep === 1 && (
            <>
              <Controller
                name="authType"
                control={control}
                render={({ field }) => (
                  // <TextField
                  //   label="Authentication Type"
                  //   fullWidth
                  //   {...field}
                  //   error={!!errors.authType}
                  //   helperText={errors.authType?.message}
                  // />
                      <FormControl fullWidth error={!!errors.authType}>
      <InputLabel>Authentication Type *</InputLabel>
      <Select
        label="Authentication Type *"
          sx={{ paddingRight: "40px" }}
        {...field}
            endAdornment={
          <InputAdornment position="end" style={{

          }}>
            <Tooltip
              title="Your PIN was sent with your new bill email notice.If you cannot find your PIN, please select one of the other authentication methods.
"
              placement="top"
              arrow
            >
              <IconButton size="small" edge="end">
                <Question size={20} color="#90caf9" weight="fill" />
              </IconButton>
            </Tooltip>

          </InputAdornment>
        }
      >
        <MenuItem value="lastName">Last Name / Business Name</MenuItem>
        <MenuItem value="billingAddress">Billing Address</MenuItem>
        <MenuItem value="pin">PIN</MenuItem>
      </Select>
      {errors.authType && (
        <FormHelperText>{errors.authType.message}</FormHelperText>
      )}
    </FormControl>
                )}
              />
              <Controller
                name="authAnswer"
                control={control}
                render={({ field }) => (
                  <TextField
                    label=" Answer *"
                    fullWidth
                    {...field}
                    error={!!errors.authAnswer}
                    helperText={errors.authAnswer?.message}
                  />
                )}
              />
            </>
          )}

          {activeStep === 2 && (
            <>
              {/* <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Login ID or Email *"
                    fullWidth
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email?.message}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip
              title="This ID or email is what you will use to log in to your account."
              placement="top"
              arrow
            >
              <IconButton size="small" edge="end">
                <Question size={20} color="#90caf9" weight="fill" />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )



                  />
                )}

              /> */}

              <Controller
  name="email"
  control={control}
  render={({ field }) => (
    <TextField
      label="Login ID or Email *"
      fullWidth
      {...field}
      error={!!errors.email}
      helperText={errors.email?.message}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip
              title="This ID or email is what you will use to log in to your account."
              placement="top"
              arrow
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
              {/* <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    {...field}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    {...field}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              /> */}

              {/* ─── Password ──────────────────────────────────────────────────────────── */}
<Controller
  name="password"
  control={control}
  render={({ field }) => (
    <FormControl fullWidth error={!!errors.password}>
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

      {/* Strength bar — visible only while typing */}
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

      {errors.password && (
        <FormHelperText>{errors.password.message}</FormHelperText>
      )}
    </FormControl>
  )}
/>

{/* ─── Confirm Password ───────────────────────────────────────────────────── */}
<Controller
  name="confirmPassword"
  control={control}
  render={({ field }) => (
    <FormControl fullWidth error={!!errors.confirmPassword}>
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
      {errors.confirmPassword && (
        <FormHelperText>{errors.confirmPassword.message}</FormHelperText>
      )}
    </FormControl>
  )}
/>
            </>
          )}

          {activeStep === 3 && (
            <>
              <Controller
                name="notificationEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Notification Email *"
                    fullWidth
                    {...field}
                    error={!!errors.notificationEmail}
                    helperText={errors.notificationEmail?.message}
                          InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip
              title="This email is where you will receive notifications and may be the same as a login email."
              placement="top"
              arrow
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
                    error={!!errors.confirmNotificationEmail}
                    helperText={errors.confirmNotificationEmail?.message}
                  />
                )}
              />
              {/* <Controller
                name="countryCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Country Code"
                    fullWidth
                    {...field}
                    error={!!errors.countryCode}
                    helperText={errors.countryCode?.message}
                  >
                    <MenuItem value="1">1 - United States</MenuItem>
                    <MenuItem value="91">91 - India</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Mobile Phone"
                    fullWidth
                    {...field}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              /> */}

              {/* ─── Country Code + Phone (inline row) ─────────────────────────── */}
    <Stack direction="row" spacing={1} alignItems="flex-start">
      {/* Country Code Select */}
      <Controller
        name="countryCode"
        control={control}
        render={({ field }) => (
          <FormControl
            error={!!errors.countryCode}
            sx={{ minWidth: 160 }}
          >
            <InputLabel>Country</InputLabel>
            <Select label="Country" {...field}>
              <MenuItem value="1">1 - United States</MenuItem>
              <MenuItem value="91">91 - India</MenuItem>
            </Select>
            {errors.countryCode && (
              <FormHelperText>{errors.countryCode.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      {/* Phone with US formatting */}
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
              onChange={(e) => {
                const formatted = formatUS(e.target.value);
                field.onChange(formatted);
              }}
              error={!!errors.phone}
              helperText={errors.phone?.message}
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
          {
            activeStep===3 &&
          
 <Typography variant="body1" fontWeight="bold" mb={2}>
Please enter your information into the fields below and click SUBMIT. You will receive an email confirmation with a link to finish creating your account.
          </Typography>}
          <Stack direction="row" justifyContent={"space-between"}>
            {
           true &&
            
            <Button
              // nClick={handleBack}>
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
              {/* {activeStep === 0 ? "Login" : "Back"} */}
              { "Back"}
            </Button>}
            {activeStep < steps.length - 1 ? (
              <Stack
              direction="row"
              >
{/* 
   <Button
              // nClick={handleBack}>
              onClick={handleCancel}
              variant="outlined"
              textTransform="none"
              disabled={loading}
              style={{
                color: colors.blue,
                borderColor: colors.blue,
                borderRadius: "12px",

                height: "41px",
                marginRight:'5px'
              }}
            >
Cancel
            </Button> */}
              <Button
                onClick={handleNext}
                disabled={loading}
                // loading={loading}
                variant="contained"
                textTransform="none"
                bgColor={colors.blue}
                hoverBackgroundColor={colors["blue.3"]}
                hoverColor="white"
                style={{ borderRadius: "12px", height: "41px" }}
              >
                Next
              </Button>
              </Stack>
            ) : (
              <Button
                loading={loading}
                disabled={loading}
                // variant="contained" type="submit">
                //  onClick={handleNext}

                variant="contained"
                type="submit"
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
      {/* <iframe
        id="worldpayIframe"
        name="worldpayIframe"
        src={`https://certtransaction.hostedpayments.com?TransactionSetupID=83F2CF81-35E5-449F-8528-F432E3196341`}
        // frameborder="0"
        scrolling="yes"
        // style="width: 100% !important; height: 250px;"
        frameBorder="0"
        title="ICG Payment"
        // onLoad={() => setIframeLoading(false)}
      ></iframe> */}
      {/* </Paper> */}
    </Box>
  );
}
