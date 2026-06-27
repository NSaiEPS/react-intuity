import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { linkAnotherAccount } from "@/state/features/accountSlice";
import { boarderRadius } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Card, Divider } from "@mui/material";

import { useForm } from "react-hook-form";
import { useDispatch } from "@/hooks/redux";
import { z } from "zod";

import { paths } from "@/utils/paths";
import Header from '@/components/CommonComponents/Header';

import { setRouteChecker } from "@/state/features/dashBoardSlice";
import { AddAccountStepOne } from "./add-account-step-one";
import { AddAccountStepTwo } from "./add-account-step-two";

const page1Schema = z.object({
  accountNumber: z
    .string()
    .min(2, "Account number must be at least 2 characters")
    .refine((val) => /^[0-9.-]+$/.test(val), {
      message: "Only numbers, hyphens, or decimals are allowed",
    }),
  authenticationType: z.string().min(2, "Select an authentication type"),
  answer: z.string().min(2, "Answer must be at least 2 characters"),
});

const page2Schema = z
  .object({
    notificationEmail: z.string().min(2).email("Enter a valid email address"),
    confirmEmail: z.string().min(2).email("Enter a valid email address"),
  })
  .refine((data) => data.notificationEmail === data.confirmEmail, {
    message: "Emails don't match",
    path: ["confirmEmail"],
  });

export default function AddAccountPage() {
  const navigate = useNavigate();

  const {
    control: controlPage1,
    handleSubmit: handleSubmitPage1,
    formState: { errors: errorsPage1, isDirty },
    getValues: getValues1,
  } = useForm({
    resolver: zodResolver(page1Schema),
    defaultValues: {
      accountNumber: "",
      authenticationType: "",
      answer: "",
    },
  });

  const {
    control: controlPage2,
    formState: { errors: errorsPage2 },
    getValues: getValues2,
  } = useForm({
    resolver: zodResolver(page2Schema),
    defaultValues: {
      notificationEmail: "",
      confirmEmail: "",
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState<any>({});

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

  React.useEffect(() => {
    if (isDirty) {
      dispatch(setRouteChecker(true));
    }
    return () => {
      dispatch(setRouteChecker(false));
    };
  }, [isDirty]);

  const handleStepOne = (step: number) => {
    setLoading(true);

    const raw = getLocalStorage("intuity-user");
    const stored: IntuityUser | null = typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

    const roleId = stored?.body?.acl_role_id;

    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("company_id", "2");

    if (step == 1) {
      formData.append("step", "1");
      formData.append("account_no", getValues1("accountNumber"));
      formData.append("authentication", getValues1("authenticationType"));
      formData.append("authentication_field", getValues1("answer"));

      dispatch(
        linkAnotherAccount(
          formData,
          (res) => {
            setAccountDetails({
              ...accountDetails,
              ...res,
            });
            setCurrentPage(2);
          },
          setLoading
        )
      );
    } else {
      formData.append("account_number", getValues1("accountNumber"));
      formData.append("authentication", getValues1("authenticationType"));
      formData.append("authentication_field", getValues1("answer"));
      formData.append("email", getValues2("notificationEmail"));
      formData.append("confirm_email", getValues2("confirmEmail"));
      formData.append("is_autopay", "0");
      formData.append("is_payment_schedule", "0");
      formData.append("page", "1");
      formData.append("company_login", "cape-royale1");
      formData.append("customer_id", accountDetails?.customer_id);
      formData.append("acctnum", getValues1("accountNumber"));

      dispatch(linkAnotherAccount(formData, () => navigate(paths.dashboard.overview()), setLoading));
    }
  };

  const handleBack = () => {
    setCurrentPage((prev) => prev - 1);
  };

  return (
    <Card sx={{ borderRadius: boarderRadius.card }}>
      <Header title="Link Accounts" />

      <Divider />
      <Box
        sx={{
          maxWidth: 500,
          mx: "auto",
          mt: 6,
          mb: 6,
          px: 3,
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {currentPage === 1 && (
          <AddAccountStepOne
            control={controlPage1}
            errors={errorsPage1}
            loading={loading}
            onNext={handleSubmitPage1(() => handleStepOne(1))}
          />
        )}

        {currentPage === 2 && (
          <AddAccountStepTwo
            control={controlPage2}
            errors={errorsPage2}
            loading={loading}
            onBack={handleBack}
            onNext={handleSubmitPage1(() => handleStepOne(2))}
          />
        )}

        {/* Step indicators */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: currentPage === 1 ? "#9e9e9e" : "#e0e0e0",
              mx: 0.5,
            }}
          />
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: currentPage === 2 ? "#9e9e9e" : "#e0e0e0",
              mx: 0.5,
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}
