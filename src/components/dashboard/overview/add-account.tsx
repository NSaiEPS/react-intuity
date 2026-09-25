import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { linkAnotherAccount } from "@/state/features/accountSlice";
import { getDashboardInfo, setRouteChecker } from "@/state/features/dashBoardSlice";
import { boarderRadius, colors, getCurrentCompanySlug, CustomerInfo } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { paths } from "@/utils/paths";
import { RootState } from "@/state/store";
import { useDispatch, useSelector } from "@/hooks/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { Button } from "nsaicomponents";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Header from "@/components/CommonComponents/header-common";
import { CustomStepper } from "@/components/auth/sign-up-stepper";
import { AddAccountStepOne } from "./add-account-step-one";
import { AddAccountStepTwo } from "./add-account-step-two";
import { FeeDisclaimerNote } from "./fee-disclaimer-note";

const steps = ["Account Info", "Contact Info"];

const addAccountSchema = z
  .object({
    accountNumber: z.string().min(1, "Enter a valid Account Number"),
    authType: z.string().min(1, "Authentication is required"),
    authAnswer: z.string().min(1, "Answer is required"),
    notificationEmail: z.string().email("Enter a valid Email"),
    confirmNotificationEmail: z.string().email("Emails must match"),
  })
  .refine((data) => data.notificationEmail === data.confirmNotificationEmail, {
    message: "Emails do not match",
    path: ["confirmNotificationEmail"],
  });

type AddAccountFormData = z.infer<typeof addAccountSchema>;

export default function AddAccountPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [stepSubmitAttempted, setStepSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState<any>({});

  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);
  const { companyInfo } = useSelector((state: RootState) => state?.Account);

  const rawUser = getLocalStorage("intuity-user");
  const storedUser: IntuityUser | null =
    typeof rawUser === "object" && rawUser !== null ? (rawUser as IntuityUser) : null;

  const customerData: CustomerInfo | undefined =
    (dashBoardInfo?.body?.customer as unknown as CustomerInfo) ||
    (getLocalStorage("intuity-customerInfo") as CustomerInfo);

  const defaultUserEmail = useMemo(() => {
    return (
      storedUser?.body?.email ||
      customerData?.email ||
      ""
    );
  }, [storedUser, customerData]);

  const {
    control,
    trigger,
    getValues,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<AddAccountFormData>({
    resolver: zodResolver(addAccountSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      accountNumber: "",
      authType: "last_name",
      authAnswer: "",
      notificationEmail: defaultUserEmail,
      confirmNotificationEmail: defaultUserEmail,
    },
  });

  // Prepopulate notification emails when defaultUserEmail becomes available
  useEffect(() => {
    if (defaultUserEmail) {
      const currentEmail = getValues("notificationEmail");
      const currentConfirm = getValues("confirmNotificationEmail");
      if (!currentEmail) {
        setValue("notificationEmail", defaultUserEmail, { shouldDirty: false, shouldValidate: false });
      }
      if (!currentConfirm) {
        setValue("confirmNotificationEmail", defaultUserEmail, { shouldDirty: false, shouldValidate: false });
      }
    }
  }, [defaultUserEmail, setValue, getValues]);

  // Handle dirty route protection & window beforeunload
  useEffect(() => {
    dispatch(setRouteChecker(isDirty));
    return () => {
      dispatch(setRouteChecker(false));
    };
  }, [isDirty, dispatch]);

  useEffect(() => {
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

  const showError = (fieldError: unknown) =>
    stepSubmitAttempted ? fieldError : undefined;

  const getFieldsForStep = (step: number): (keyof AddAccountFormData)[] => {
    switch (step) {
      case 0:
        return ["accountNumber", "authType", "authAnswer"];
      case 1:
        return ["notificationEmail", "confirmNotificationEmail"];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    setStepSubmitAttempted(true);
    const valid = await trigger(getFieldsForStep(activeStep));
    if (valid) {
      if (activeStep === 0) {
        handleStepOne();
      } else {
        handleStepTwo();
      }
    }
  };

  const handleStepOne = () => {
    setLoading(true);

    const roleId = storedUser?.body?.acl_role_id || "4";
    const resolvedCompanyId =
      customerData?.company_id ||
      (dashBoardInfo?.body?.customer as any)?.company_id ||
      (dashBoardInfo as any)?.company_id ||
      "2";

    const formData = new FormData();
    formData.append("acl_role_id", String(roleId));
    formData.append("company_id", String(resolvedCompanyId));
    formData.append("step", "1");
    formData.append("account_no", getValues("accountNumber"));
    formData.append("authentication", getValues("authType"));
    formData.append("authentication_field", getValues("authAnswer"));

    dispatch(
      linkAnotherAccount(
        formData,
        (res) => {
          setAccountDetails(res || {});
          setStepSubmitAttempted(false);
          setActiveStep(1);
          if (res?.email) {
            setValue("notificationEmail", res.email, { shouldDirty: false });
            setValue("confirmNotificationEmail", res.email, { shouldDirty: false });
          }
        },
        setLoading
      )
    );
  };

  const handleStepTwo = () => {
    setLoading(true);

    const roleId = storedUser?.body?.acl_role_id || "4";
    const resolvedCompanyId =
      customerData?.company_id ||
      (dashBoardInfo?.body?.customer as any)?.company_id ||
      (dashBoardInfo as any)?.company_id ||
      "2";

    const resolvedCompanyAlias =
      (customerData as any)?.company_alias ||
      (dashBoardInfo?.body?.customer as any)?.company_alias ||
      (dashBoardInfo as any)?.company_alias ||
      companyInfo?.company?.alias ||
      getCurrentCompanySlug() ||
      "cape-royale1";

    const formData = new FormData();
    formData.append("acl_role_id", String(roleId));
    formData.append("company_id", String(resolvedCompanyId));
    formData.append("account_number", getValues("accountNumber"));
    formData.append("authentication", getValues("authType"));
    formData.append("authentication_field", getValues("authAnswer"));
    formData.append("email", getValues("notificationEmail"));
    formData.append("confirm_email", getValues("confirmNotificationEmail"));
    formData.append("is_autopay", "0");
    formData.append("is_payment_schedule", "0");
    formData.append("page", "1");
    formData.append("company_login", resolvedCompanyAlias);
    formData.append("customer_id", accountDetails?.customer_id);
    formData.append("acctnum", getValues("accountNumber"));

    dispatch(
      linkAnotherAccount(
        formData,
        () => {
          reset(getValues()); // Clear isDirty
          const newRoleId = storedUser?.body?.acl_role_id;
          const newUserId = storedUser?.body?.customer_id;
          if (newRoleId && newUserId) {
            dispatch(getDashboardInfo(newRoleId, newUserId));
          }
          navigate(paths.dashboard.overview());
        },
        setLoading
      )
    );
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate(paths.dashboard.overview());
    } else {
      setStepSubmitAttempted(false);
      setActiveStep(0);
    }
  };

  return (
    <Card sx={{ borderRadius: boarderRadius.card }}>
      <Header title="Link Accounts" />
      <Divider />
      <Box
        sx={{
          maxWidth: 580,
          width: { xs: "95%", sm: "90%", md: "560px" },
          mx: "auto",
          mt: { xs: 3, sm: 5 },
          mb: { xs: 3, sm: 5 },
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4 },
          border: "1px solid #eaecf0",
          borderRadius: "16px",
          boxShadow: "0px 2px 16px rgba(99, 132, 200, 0.08), 0px 1px 4px rgba(0,0,0,0.04)",
          backgroundColor: "#fff",
        }}
      >
        <CustomStepper activeStep={activeStep} steps={steps} />

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
            <Typography variant="h5" fontWeight={700} mb={0.5} sx={{ color: colors.blue }}>
              {steps[activeStep]}
            </Typography>
          </Box>
        </Box>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
        >
          <Stack spacing={2}>
            {activeStep === 0 && (
              <AddAccountStepOne
                control={control}
                errors={errors}
                showError={showError}
              />
            )}

            {activeStep === 1 && (
              <AddAccountStepTwo
                control={control}
                errors={errors}
                showError={showError}
                accountDetails={accountDetails}
                accountNumber={getValues("accountNumber")}
              />
            )}

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
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
                  width: "110px",
                  backgroundColor: "white",
                  fontWeight: 600,
                }}
              >
                ← Back
              </Button>

              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                variant="contained"
                textTransform="none"
                bgColor={colors.blue}
                hoverBackgroundColor={colors["blue.3"]}
                hoverColor="white"
                style={{
                  borderRadius: "12px",
                  height: "44px",
                  width: "110px",
                  fontWeight: 600,
                }}
              >
                {activeStep === 1 ? "Submit" : "Next"}{` →`}
              </Button>
            </Stack>
          </Stack>
        </form>

        <FeeDisclaimerNote />
      </Box>
    </Card>
  );
}
