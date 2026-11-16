import * as React from "react";

import { registerApiRequest } from "@/state/features/accountSlice";
import { registerApi } from "@/api/dashboard";
import { toast } from "@/lib/custom-toast";
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

import { getLocalStorage } from "@/utils/auth";

// Re-export stepper pieces so existing imports from this file keep working
export { CustomConnector, CustomStepIcon } from "./sign-up-stepper";

export type Step1SubState = "LOOKUP_STATE" | "VERIFICATION_STATE";

const isValidEmailFormat = (email: unknown): boolean => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

function getAvailableEmail(
  compResp?: any,
  oneTimeInfo?: any,
  portalUsername?: string
): string {
  // 1. Direct sessionStorage / localStorage key for guest confirmation email
  try {
    const directEmail =
      sessionStorage.getItem("guest-confirmation-email") ||
      sessionStorage.getItem("guest-payment-email") ||
      localStorage.getItem("guest-confirmation-email");
    if (isValidEmailFormat(directEmail)) {
      return (directEmail as string).trim();
    }
  } catch {
    // Ignore storage parse errors
  }

  // 2. Company response from registration step 1 / step 2 API
  const compEmail =
    compResp?.email ||
    compResp?.customer?.email ||
    compResp?.notification_email ||
    compResp?.customer_email ||
    compResp?.user_email ||
    compResp?.customer_details?.email ||
    compResp?.details?.email ||
    compResp?.data?.email;
  if (isValidEmailFormat(compEmail)) {
    return (compEmail as string).trim();
  }

  // 3. Redux oneTimePaymentInfo from Pay as Guest
  const reduxEmail =
    oneTimeInfo?.customer?.email ||
    oneTimeInfo?.email ||
    oneTimeInfo?.customer_email;
  if (isValidEmailFormat(reduxEmail)) {
    return (reduxEmail as string).trim();
  }

  // 4. Session storage guest-payment-state snapshot
  try {
    const raw = sessionStorage.getItem("guest-payment-state");
    if (raw) {
      const parsed = JSON.parse(raw);
      const sessionEmail =
        parsed?.formData?.email ||
        parsed?.customerDetails?.email ||
        parsed?.customerDetails?.customer?.email ||
        parsed?.oneTimeData?.customer?.email ||
        parsed?.oneTimeData?.email;
      if (isValidEmailFormat(sessionEmail)) {
        return (sessionEmail as string).trim();
      }
    }
  } catch {
    // Ignore storage parse errors
  }

  // 5. Existing local/secure storage user/customer information
  try {
    const custInfo = getLocalStorage("intuity-customerInfo") as any;
    if (custInfo && isValidEmailFormat(custInfo?.email)) {
      return custInfo.email.trim();
    }
    const intuityUser = getLocalStorage("intuity-user") as any;
    const userEmail = intuityUser?.email || intuityUser?.body?.email;
    if (isValidEmailFormat(userEmail)) {
      return userEmail.trim();
    }
  } catch {
    // Ignore storage parse errors
  }

  // 6. Portal Username (if the user entered an email in Step 2)
  if (portalUsername && isValidEmailFormat(portalUsername)) {
    return portalUsername.trim();
  }

  return "";
}

export function SignUpForm() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [step1SubState, setStep1SubState] = React.useState<Step1SubState>("LOOKUP_STATE");
  const [lookupState, setLookupState] = React.useState<{
    accountNumber: string;
    isCashpower: 0 | 1 | null;
    lookupError: string | null;
    isLoading: boolean;
  }>({
    accountNumber: "",
    isCashpower: null,
    lookupError: null,
    isLoading: false,
  });

  const [stepSubmitAttempted, setStepSubmitAttempted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [companyResponse, setCompanyResponse] = React.useState<any>({});
  const lastAutoFilledEmailRef = React.useRef<string>("");

  const location = useLocation();
  const pathname = location.pathname;
  const slugMatch = pathname.startsWith("/register-")
    ? pathname.replace("/register-", "")
    : null;

  const { companyInfo, oneTimePaymentInfo } = useSelector((state: RootState) => state?.Account);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialGuestEmail = React.useMemo(() => {
    return getAvailableEmail(undefined, oneTimePaymentInfo);
  }, [oneTimePaymentInfo]);

  const {
    control,
    trigger,
    getValues,
    setValue,
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
      meterNumber: "",
      isCashpower: null,
      notificationEmail: initialGuestEmail,
      confirmNotificationEmail: "",
      phone: "",
      countryCode: "1",
    },
  });

  // Auto-fill notification email from available sources if field hasn't been manually modified
  React.useEffect(() => {
    const portalUser = getValues("email");
    const emailToSet = getAvailableEmail(companyResponse, oneTimePaymentInfo, portalUser);
    if (emailToSet) {
      const currentNotif = getValues("notificationEmail");
      if (!currentNotif || currentNotif === lastAutoFilledEmailRef.current) {
        setValue("notificationEmail", emailToSet, { shouldDirty: false, shouldValidate: false });
      }
      lastAutoFilledEmailRef.current = emailToSet;
    }
  }, [companyResponse, oneTimePaymentInfo, activeStep, setValue, getValues]);

  // Only show error after user clicks Next / Submit on this step
  const showError = (fieldError: unknown) =>
    stepSubmitAttempted ? fieldError : undefined;

  const getFieldsForStep = (step: number): (keyof RegisterFormData)[] => {
    switch (step) {
      case 0:
        if (step1SubState === "LOOKUP_STATE") {
          return ["accountNumber"];
        }
        return lookupState.isCashpower === 1
          ? ["meterNumber"]
          : ["authType", "authAnswer"];
      case 1:
        return ["email", "password", "confirmPassword"];
      case 2:
        return ["notificationEmail", "confirmNotificationEmail", "phone", "countryCode"];
      default:
        return [];
    }
  };

  const handleAccountLookup = async () => {
    setStepSubmitAttempted(true);
    const valid = await trigger(["accountNumber"]);
    const accNo = (getValues("accountNumber") || "").trim();
    if (!valid || !accNo) return;

    setLookupState((prev) => ({ ...prev, isLoading: true, lookupError: null }));

    try {
      const alias = companyInfo?.company?.alias || slugMatch || "";
      const companyId = companyInfo?.company?.id;

      const formData = new FormData();
      formData.append("step", "lookup");
      formData.append("account_no", accNo);
      if (companyId) {
        formData.append("company_id", String(companyId));
      }

      const res: any = await registerApi({ formData, alias });

      if (res?.status) {
        const rawCp =
          res?.body?.is_cashpower ??
          res?.body?.isCashpower ??
          res?.is_cashpower ??
          res?.isCashpower ??
          res?.data?.is_cashpower ??
          res?.data?.isCashpower;

        const isCp: 0 | 1 =
          rawCp === 1 || rawCp === "1" || rawCp === true ? 1 : 0;

        setLookupState({
          accountNumber: accNo,
          isCashpower: isCp,
          lookupError: null,
          isLoading: false,
        });
        setValue("isCashpower", isCp);

        if (res?.body) {
          setCompanyResponse((prev: any) => ({ ...prev, ...res.body }));
          if (res.body.customer_name && !getValues("name")) {
            setValue("name", res.body.customer_name, { shouldDirty: false });
          }
        }

        setStep1SubState("VERIFICATION_STATE");
        setStepSubmitAttempted(false);
      } else {
        const msg =
          (typeof res?.message === "string" ? res.message : res?.message?.[0]) ||
          "Unable to find account. Please verify your account number and try again.";
        setLookupState((prev) => ({
          ...prev,
          isLoading: false,
          lookupError: msg,
        }));
        toast.error(msg);
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Account lookup failed. Please try again.";
      setLookupState((prev) => ({
        ...prev,
        isLoading: false,
        lookupError: errMsg,
      }));
      toast.error(errMsg);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0 && step1SubState === "LOOKUP_STATE") {
      await handleAccountLookup();
      return;
    }

    setStepSubmitAttempted(true);
    const valid = await trigger(getFieldsForStep(activeStep));
    if (valid) apiCall();
  };

  const apiCall = () => {
    setLoading(true);
    const formData = new FormData();

    if (activeStep === 0) {
      formData.append("account_no", getValues("accountNumber").trim());
      if (lookupState.isCashpower === 1) {
        const meter = getValues("meterNumber")?.trim() || "";
        formData.append("meter_number", meter);
        formData.append("authentication", "meter_number");
        formData.append("authentication_field", meter);
        formData.append("is_cashpower", "1");
      } else {
        formData.append("authentication", getValues("authType"));
        formData.append("authentication_field", getValues("authAnswer"));
        formData.append("is_cashpower", "0");
      }
    }
    if (activeStep === 1) {
      formData.append("user_id", getValues("email"));
      formData.append("password", getValues("password"));
      formData.append("confirm_password", getValues("confirmPassword"));
      formData.append("company_alias", companyInfo?.company?.alias || slugMatch || "");
      formData.append("customer_id", companyResponse?.customer_id);
      formData.append("acl_role_id", "4");
    }
    if (activeStep === 2) {
      formData.append("name", getValues("name") || companyResponse?.customer_name || "");
      formData.append("account_no", getValues("accountNumber").trim());
      if (lookupState.isCashpower === 1) {
        const meter = getValues("meterNumber")?.trim() || "";
        formData.append("meter_number", meter);
        formData.append("authentication", "meter_number");
        formData.append("authentication_field", meter);
        formData.append("is_cashpower", "1");
      } else {
        formData.append("authentication", getValues("authType"));
        formData.append("authentication_field", getValues("authAnswer"));
        formData.append("is_cashpower", "0");
      }
      formData.append("user_id", getValues("email"));
      formData.append("password", getValues("password"));
      formData.append("confirm_password", getValues("confirmPassword"));
      formData.append("company_alias", companyInfo?.company?.alias || slugMatch || "");
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

    const alias = companyInfo?.company?.alias || slugMatch;
    dispatch(registerApiRequest(formData, successCallBack, setLoading, alias, activeStep));
  };

  const successCallBack = (data: any) => {
    if (activeStep === 2) {
      try {
        sessionStorage.removeItem("guest-confirmation-email");
      } catch { }
      reset(getValues()); // clear isDirty so beforeunload doesn't fire
      setActiveStep((prev) => prev + 1);
      return;
    }
    setStepSubmitAttempted(false);
    setActiveStep((prev) => prev + 1);
    setCompanyResponse((prev: any) => ({ ...prev, ...data }));

    const portalUser = getValues("email");
    const emailFromData = getAvailableEmail(data, oneTimePaymentInfo, portalUser);
    if (emailFromData) {
      const currentNotif = getValues("notificationEmail");
      if (!currentNotif || currentNotif === lastAutoFilledEmailRef.current) {
        setValue("notificationEmail", emailFromData, { shouldDirty: false, shouldValidate: false });
      }
      lastAutoFilledEmailRef.current = emailFromData;
    }
    if (data?.customer_name && !getValues("name")) {
      setValue("name", data.customer_name, { shouldDirty: false });
    }

    setLoading(false);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      if (step1SubState === "VERIFICATION_STATE") {
        setStep1SubState("LOOKUP_STATE");
        setStepSubmitAttempted(false);
        return;
      }
      navigate(slugMatch ? paths.auth.newLogin(slugMatch) : paths.auth.newLogin());
      return;
    }
    setStepSubmitAttempted(false);
    setActiveStep((prev) => prev - 1);
  };

  const handleBackToLogin = () => {
    const alias = companyInfo?.company?.alias;
    navigate(alias ? paths.auth.newLogin(alias) : paths.auth.newLogin(), {
      state: { accountActivated: true },
    });
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 4 }}>
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
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.blue }}>
              {steps[activeStep]}
            </Typography>

            {activeStep === 0 && step1SubState === "LOOKUP_STATE" && (
              <Typography variant="body2" sx={{ color: "#555", mt: 0.5 }}>
                Enter your account number to get started.
              </Typography>
            )}

            {activeStep === 0 && step1SubState === "VERIFICATION_STATE" && (
              <Typography
                variant="body1"
                sx={{ color: "#222", fontWeight: 700, mt: 0.5 }}
              >
                Account Number: {lookupState.accountNumber || getValues("accountNumber")}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (activeStep !== 3) handleNext(); }}>
        <Stack spacing={2}>

          {activeStep === 0 && (
            <StepAccountInfo
              control={control}
              errors={errors}
              showError={showError}
              subState={step1SubState}
              isCashpower={lookupState.isCashpower}
              lookupError={lookupState.lookupError}
              onClearLookupError={() => {
                if (lookupState.lookupError) {
                  setLookupState((prev) => ({ ...prev, lookupError: null }));
                }
              }}
            />
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
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Button
                onClick={handleBack}
                variant="outlined"
                textTransform="none"
                disabled={loading || lookupState.isLoading}
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  borderRadius: "12px",
                  height: "44px",
                  width:
                    activeStep === 0
                      ? step1SubState === "LOOKUP_STATE"
                        ? "auto"
                        : lookupState.isCashpower === 1
                          ? "110px"
                          : "auto"
                      : "110px",
                  backgroundColor: "white",
                  fontWeight: 600,
                  paddingLeft: "16px",
                  paddingRight: "16px",
                }}
              >
                {activeStep === 0
                  ? step1SubState === "LOOKUP_STATE"
                    ? `← Back to Login`
                    : lookupState.isCashpower === 1
                      ? `← Back`
                      : `— Back to Login`
                  : `← Back`}
              </Button>

              {activeStep < steps.length && (
                <Button
                  type="submit"
                  disabled={loading || lookupState.isLoading}
                  loading={
                    activeStep === 0 && step1SubState === "LOOKUP_STATE"
                      ? lookupState.isLoading
                      : loading
                  }
                  variant="contained"
                  textTransform="none"
                  bgColor={colors.blue}
                  hoverBackgroundColor={colors["blue.3"]}
                  hoverColor="white"
                  style={{
                    borderRadius: "12px",
                    height: "44px",
                    width:
                      activeStep === 0 && step1SubState === "LOOKUP_STATE"
                        ? "auto"
                        : "110px",
                    minWidth:
                      activeStep === 0 && step1SubState === "LOOKUP_STATE"
                        ? "160px"
                        : "110px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    fontWeight: 600,
                  }}
                >
                  {activeStep === 0 && step1SubState === "LOOKUP_STATE"
                    ? "Lookup Account →"
                    : activeStep === 2
                      ? "Submit →"
                      : "Next →"}
                </Button>
              )}
            </Stack>
          )}

        </Stack>
      </form>
    </Box>
  );
}
