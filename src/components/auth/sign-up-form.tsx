import * as React from "react";

import { registerApiRequest } from "@/state/features/accountSlice";
import { colors } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Stack, Typography } from "@mui/material";
import { Button } from "nsaicomponents";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "@/hooks/redux";
import { useLocation, useNavigate } from "react-router";
import { paths } from "@/utils/paths";
import { setRouteChecker } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { User } from "@phosphor-icons/react/dist/ssr/User";

import { schema, RegisterFormData } from "./sign-up-schema";
import { CustomStepper, steps } from "./sign-up-stepper";
import { StepAccountInfo } from "./sign-up-step-account";
import { StepPortalRegistration } from "./sign-up-step-portal";
import { StepContactInfo } from "./sign-up-step-contact";
import { StepCheckEmail } from "./sign-up-step-email";

// Re-export stepper pieces so existing imports from this file keep working
export { CustomConnector, CustomStepIcon } from "./sign-up-stepper";

export function SignUpForm() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [stepSubmitAttempted, setStepSubmitAttempted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [companyResponse, setCompanyResponse] = React.useState<any>({});

  const location = useLocation();
  const pathname = location.pathname;
  const slugMatch = pathname.startsWith("/register-")
    ? pathname.replace("/register-", "")
    : null;

  const { companyInfo } = useSelector((state: RootState) => state?.Account);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    control,
    trigger,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<RegisterFormData>({
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

  // Only show error after user clicks Next / Submit on this step
  const showError = (fieldError: unknown) =>
    stepSubmitAttempted ? fieldError : undefined;

  const getFieldsForStep = (step: number): (keyof RegisterFormData)[] => {
    switch (step) {
      case 0: return ["accountNumber", "authType", "authAnswer"];
      case 1: return ["email", "password", "confirmPassword"];
      case 2: return ["notificationEmail", "confirmNotificationEmail", "phone", "countryCode"];
      default: return [];
    }
  };

  const handleNext = async () => {
    setStepSubmitAttempted(true);
    const valid = await trigger(getFieldsForStep(activeStep));
    if (valid) apiCall();
  };

  const apiCall = () => {
    setLoading(true);
    const formData = new FormData();

    if (activeStep === 0) {
      formData.append("account_no", getValues("accountNumber"));
      formData.append("authentication", getValues("authType"));
      formData.append("authentication_field", getValues("authAnswer"));
    }
    if (activeStep === 1) {
      formData.append("user_id", getValues("email"));
      formData.append("password", getValues("password"));
      formData.append("confirm_password", getValues("confirmPassword"));
      formData.append("company_alias", companyInfo?.company?.alias);
      formData.append("customer_id", companyResponse?.customer_id);
      formData.append("acl_role_id", "4");
    }
    if (activeStep === 2) {
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
    formData.append("page", "1");

    const alias = companyInfo?.company?.alias;
    dispatch(registerApiRequest(formData, successCallBack, setLoading, alias, activeStep));
  };

  const successCallBack = (data: any) => {
    if (activeStep === 2) {
      reset(getValues()); // clear isDirty so beforeunload doesn't fire
      setActiveStep((prev) => prev + 1);
      return;
    }
    setStepSubmitAttempted(false);
    setActiveStep((prev) => prev + 1);
    setCompanyResponse((prev: any) => ({ ...prev, ...data }));
    setLoading(false);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(slugMatch ? paths.auth.newLogin(slugMatch) : paths.auth.newLogin());
      return;
    }
    setStepSubmitAttempted(false);
    setActiveStep((prev) => prev - 1);
  };

  const handleBackToLogin = () => {
    const alias = companyInfo?.company?.alias;
    navigate(alias ? paths.auth.newLogin(alias) : paths.auth.newLogin());
  };

  // Dirty-route guard
  React.useEffect(() => {
    dispatch(setRouteChecker(isDirty));
    return () => { dispatch(setRouteChecker(false)); };
  }, [isDirty]);

  // Warn before tab close when form is dirty
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
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <Box>
      <CustomStepper activeStep={activeStep} />

      {/* Step header — hidden on success screen */}
      {activeStep !== 3 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 5 }}>
          <Box
            sx={{
              width: 72, height: 72, borderRadius: "50%",
              backgroundColor: "#e8f0fb", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <User size={36} color={colors.blue} weight="regular" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ color: colors.blue }}>
              {steps[activeStep]}
            </Typography>
          </Box>
        </Box>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (activeStep !== 3) handleNext(); }}>
        <Stack spacing={2}>

          {activeStep === 0 && (
            <StepAccountInfo control={control} errors={errors} showError={showError} />
          )}
          {activeStep === 1 && (
            <StepPortalRegistration control={control} errors={errors} showError={showError} />
          )}
          {activeStep === 2 && (
            <StepContactInfo
              control={control}
              errors={errors}
              showError={showError}
              companyResponse={companyResponse}
            />
          )}
          {activeStep === 3 && (
            <StepCheckEmail onBackToLogin={handleBackToLogin} />
          )}

          {/* Back / Next navigation */}
          {activeStep !== 3 && (
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
                  width: activeStep === 0 ? "auto" : "110px",
                  backgroundColor: "white",
                  fontWeight: 600,
                }}
              >
                {activeStep === 0 ? `← Back to Login` : `← Back`}
              </Button>

              {activeStep < steps.length && (
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  variant="contained"
                  textTransform="none"
                  bgColor={colors.blue}
                  hoverBackgroundColor={colors["blue.3"]}
                  hoverColor="white"
                  style={{ borderRadius: "12px", height: "44px", width: "110px", fontWeight: 600 }}
                >
                  {activeStep === 2 ? "Submit" : "Next"}{` →`}
                </Button>
              )}
            </Stack>
          )}

        </Stack>
      </form>
    </Box>
  );
}
