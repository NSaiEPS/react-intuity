import * as React from "react";

import { registerApiRequest } from "@/state/features/accountSlice";
import { colors } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  // Button,
  Divider,
  MenuItem,
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
import { useDispatch } from "react-redux";
import { z } from "zod";
import { useNavigate } from "react-router";
import { paths } from "@/utils/paths";

// Schema
const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    accountNumber: z.string().min(1, "Account Number is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(6, "Minimum 6 characters"),
    authType: z.string().min(1, "Authentication is required"),
    authAnswer: z.string().min(1, "Answer is required"),
    notificationEmail: z.string().email("Invalid email"),
    confirmNotificationEmail: z.string().email("Emails must match"),
    phone: z.string().min(10, "Phone number required"),
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

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 16,
    left: "-70px",
    right: "20px",
    marginLeft: "500px",
  },
  // 👇 This targets the first step connector visually (the one after Step 1)
  // [`&:nth-of-type(2).${stepConnectorClasses.alternativeLabel}`]: {
  //   left: 'calc(50% + 2px)', // pushes line away from the circle
  // },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    backgroundColor: customColor,
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: theme.palette.grey[300],
  },
}));

// const CustomConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.alternativeLabel}`]: {
//     top: 22,
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     borderColor: "#ccc",
//     borderTopWidth: 2,
//     borderRadius: 1,
//   },
// }));
const CustomStepIcon = ({ active, completed, icon }: any) => {
  return (
    <div
      style={{
        backgroundColor: active || completed ? customColor : "#ccc",
        color: "#fff",
        borderRadius: "50%",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
      }}
    >
      {/* {completed ? icon : icon} */}
      {completed ? <Check size={20} weight="bold" /> : icon}
    </div>
  );
};

// Example usage
const steps = [
  "Account Info",
  "Authentication",
  "Login Credentials",
  "Contact Info",
];

export const CustomStepper = ({ activeStep }: { activeStep: number }) => {
  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={<CustomConnector />}
        sx={{
          mb: 4,
          maxWidth: 700,
          marginX: "auto",
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} className={index === 0 ? "first-connector" : ""}>
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

  const steps = [
    "Account Info",
    "Authentication",
    "Login Credentials",
    "Contact Info",
  ];

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
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
      countryCode: "",
    },
  });

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
      formData.append("company_alias", companyResponse?.company_alias);

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
      formData.append("company_alias", companyResponse?.company_alias);
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

    formData.append("company_id", "2");

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

    dispatch(registerApiRequest(formData, successCallBack, seLoading));
  };
  const successCallBack = (data) => {
    setActiveStep((prev) => prev + 1);
    setCompanyResponse({ ...companyResponse, ...data });
    seLoading(false);
    if (activeStep == 3) {
      window.location.href = "/intuityfe/auth/sign-in";
    }
  };
  const navigate = useNavigate();

  const handleBack = () => {
    if (activeStep === 0) {
      // Redirect to login if on the first step
      // window.location.href = '/intuityfe/auth/sign-in';

      navigate(paths.auth.newLogin());

      return;
    }
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = (data: FormData) => {
    apiCall();
    // API call here
  };

  return (
    // <Paper
    //   // elevation={3}
    //   sx={{ maxWidth: 600, margin: 'auto' }}
    // >
    <Box sx={{ maxWidth: 600, margin: "auto" }}>
      {/* <Typography variant="h4" gutterBottom>
        Sign Up Request
      </Typography> */}
      <CustomStepper activeStep={activeStep} />

      {/* <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label} sx={{}}>
            <StepLabel
              sx={{
                color: colors.blue,
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper> */}

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
                    label="Name"
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
                    label="Account Number"
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
                  <TextField
                    label="Authentication Type"
                    fullWidth
                    {...field}
                    error={!!errors.authType}
                    helperText={errors.authType?.message}
                  />
                )}
              />
              <Controller
                name="authAnswer"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Authentication Answer"
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
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Login Email"
                    fullWidth
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
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
                    label="Notification Email"
                    fullWidth
                    {...field}
                    error={!!errors.notificationEmail}
                    helperText={errors.notificationEmail?.message}
                  />
                )}
              />
              <Controller
                name="confirmNotificationEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Confirm Notification Email"
                    fullWidth
                    {...field}
                    error={!!errors.confirmNotificationEmail}
                    helperText={errors.confirmNotificationEmail?.message}
                  />
                )}
              />
              <Controller
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
              />
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" justifyContent="space-between">
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
              {activeStep === 0 ? "Login" : "Back"}
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                loading={loading}
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
      {/* </Paper> */}
    </Box>
  );
}
