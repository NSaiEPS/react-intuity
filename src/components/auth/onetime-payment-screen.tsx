import React, { useEffect, useState } from "react";
import {
  getConvenienceFee,
  getPaymentProcessorDetails,
  guestPaymentRequest,
  oneTimePayment,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { calculatePaymentAmount, colors } from "@/utils";
import { pdf } from "@react-pdf/renderer";
import {
  Backdrop,
  Box,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  Step,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Question } from "@phosphor-icons/react";
import { Button } from "nsaicomponents";
import { useDispatch, useSelector } from "@/hooks/redux";
import { toast } from "@/lib/custom-toast";
import DOMPurify from "dompurify";
import PaymentIframe from "../CommonComponents/PaymentIframeModal";
import { CustomConnector, CustomStepIcon } from "./sign-up-stepper";
import secureLocalStorage from "react-secure-storage";
import OneTimePdf from "../dashboard/layout/one-time-invoice";
import CustomModal from "../dashboard/layout/invoice-pdf-modal";
import { navigateTo } from "@/utils/navigation";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";



import { OutlinedInput, FormControl, FormHelperText, InputLabel } from "@mui/material";
import { Button as MUIButton } from "@mui/material";
import { User } from "@phosphor-icons/react/dist/ssr/User";
import { CreditCard } from "@phosphor-icons/react/dist/ssr/CreditCard";
import { CurrencyDollar } from "@phosphor-icons/react/dist/ssr/CurrencyDollar";
import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { Receipt } from "@phosphor-icons/react/dist/ssr/Receipt";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { BASE_URL } from "@/api/axios";
const steps = ["Retrieve Bill", "Confirm Amount", "Enter Payment Method"];

export default function OneTimePaymentScreen() {
  const [isDirty, setIsDirty] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const [iframeLoading, setIframeLoading] = useState(true);
  const [hovered, setHovered] = useState(false);

  const companyInfo = useSelector(
    (state: RootState) => state.Account.companyInfo
  );
  const accountLoading = useSelector(
    (state: RootState) => state.Account.accountLoading
  );
  const oneTimeData = useSelector(
    (state: RootState) => state.Account.oneTimePaymentInfo
  );

  const [formData, setFormData] = useState({
    accountNo: "",
    invoiceAmount: "",
    name: "",
    email: "",
    amountToPay: "",
    convenienceFee: "",
    totalPayment: "",
    paymentType: "card",
    street: "",
  });
  const [customerDetails, setCustomerDetails] = useState<any>({});

  type FormErrors = {
    accountNo?: string;
    invoiceAmount?: string;
    amountToPay?: string;
    paymentType?: string;
    [key: string]: string | undefined;
  };

  const [errors, setErrors] = useState<FormErrors>({});

  const confirmIfDirty = () => {
    if (!isDirty) return true;
    return window.confirm(
      "You have unsaved changes. Are you sure you want to leave?"
    );
  };

  const handleChange = (field) => (e) => {
    setIsDirty(true);
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" });
  };

  const convenienceFee = useSelector(
    (state: RootState) => state?.Account.convenienceFee
  );

  useEffect(() => {
    const fee = calculatePaymentAmount({
      amount: formData.amountToPay || "0",
      paymentType: formData.paymentType,
      cardType: "visa",
      config: convenienceFee,
    }).convenienceFee.toFixed(2);

    setFormData((prev) => ({
      ...prev,
      convenienceFee: fee,
      totalPayment: (Number(fee) + Number(formData.amountToPay)).toFixed(2),
    }));

    if (activeStep == 2 && convenienceFee?.config_data_ach) {
      const worldPlayDetails = {
        account_number: formData.accountNo,
        invoice_amount: formData.invoiceAmount,
        name: formData.name,
        email: formData.email,
        amount: Number(formData.amountToPay).toFixed(2),
        convenienceFee: Number(fee).toFixed(2),
        totalPayment: (Number(fee) + Number(formData.amountToPay)).toFixed(2),
        paymentType: formData.paymentType,
        street: formData.street,
        company_id: companyInfo?.company?.id,
        company_alias: companyInfo?.company?.alias,
        customer_id: customerDetails?.id,
        success_authenticate: "1",
        billing_id: customerDetails?.billing_id,
        is_one_time: "1",
        is_card: "1",
      };
      secureLocalStorage.setItem("worldplay-details", worldPlayDetails);
    }
  }, [formData.amountToPay, convenienceFee, activeStep]);

  const validateStep = () => {
    let newErrors: Record<string, string> = {};
    if (activeStep === 0) {
      if (!formData.accountNo)
        newErrors.accountNo = "Account No. is required";
      if (!formData.invoiceAmount)
        newErrors.invoiceAmount = "Invoice Amount is required";
      // else if (!/^\d+(\.\d+)?$/.test(formData.invoiceAmount))
      else if (!/^-?\d{1,3}(,\d{3})*(\.\d+)?$|^-?\d+(\.\d+)?$/.test(formData.invoiceAmount))
        newErrors.invoiceAmount = "Only numbers or decimals allowed";
    }
    if (activeStep === 1) {
      if (Number(formData.amountToPay) === 0 || !formData.amountToPay)
        newErrors.amountToPay = "Amount to Pay is required";
      if (!formData.name) newErrors.name = "Name is required";
      if (!formData.email) newErrors.email = "Email is required";
      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail(formData.email))
        newErrors.email = "Enter a valid email address";
    }
    if (activeStep === 2) {
      if (!formData.paymentType)
        newErrors.paymentType = "Please select a payment method";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleRetrieveBill = () => {
    if (!formData.accountNo) {
      setErrors({ accountNo: "Account No. is required" });
      return;
    }
    if (!formData.invoiceAmount) {
      setErrors({ invoiceAmount: "Invoice Amount is required" });
      return;
    } else if (!/^-?\d{1,3}(,\d{3})*(\.\d+)?$|^-?\d+(\.\d+)?$/.test(formData.invoiceAmount)) {
      setErrors({ invoiceAmount: "Only numbers allowed" });
      return;
    }

    const paymentData = new FormData();
    paymentData.append("account_number", formData.accountNo);
    paymentData.append("invoice_amount", formData.invoiceAmount);
    paymentData.append("success_authenticate", "0");
    paymentData.append("company_id", companyInfo?.company?.id);
    paymentData.append("company_alias", companyInfo?.company?.alias);

    dispatch(
      guestPaymentRequest(
        paymentData,
        companyInfo?.company?.alias,
        (res) => {
          setCustomerDetails(res);
          setFormData((prev) => ({
            ...prev,
            name: res?.customer_name,
            email: res?.email,
            convenienceFee: "0",
            totalPayment: "0",
            street: res?.service_address,
            amountToPay: String(res?.balance ?? 0),
          }));
          handleNext();
        },
        hanldeFailure
      )
    );
  };

  const hanldeFailure = (data, noToast = false) => {
    if (noToast) {
      setIsDirty(false);
      return;
    }
    if (data) {
      toast.error(data ? data : "Try again something went wrong!");
    } else {
      toast.error("Try again something went wrong!");
    }
    setIsDirty(false);
    handleGoBack();
  };

  const handleSaveDetails = (data, companyInfo, formData, customerDetails) => {
    if (data?.error) {
      toast.error(data?.error ? data?.error : "Try again something went wrong!");
      return;
    }

    const debitType = data?.cardNumber
      ? "card"
      : data?.ssl_card_number
      ? "card"
      : "bank_account";

    const paymentData = new FormData();
    paymentData.append("account_number", formData.accountNo);
    paymentData.append("invoice_amount", formData.invoiceAmount);
    paymentData.append("company_id", companyInfo?.company?.id);
    paymentData.append("company_alias", companyInfo?.company?.alias);
    paymentData.append("customer_id", customerDetails?.id);
    paymentData.append("success_authenticate", "1");
    paymentData.append("name", formData.name);
    paymentData.append("email", formData.email);
    paymentData.append("billing_id", customerDetails?.billing_id);
    if (!data?.ssl_card_number) {
      paymentData.append("token", data?.token);
    }
    paymentData.append("is_one_time", "1");
    paymentData.append("amount", Number(formData.amountToPay).toFixed(2));
    paymentData.append("convenienceFee", Number(formData.convenienceFee).toFixed(2));

    if (debitType === "card") {
      if (data?.ssl_card_number) {
        paymentData.append("credit_card_number", data?.ssl_card_number);
        paymentData.append("expiration", data?.ssl_exp_date);
        paymentData.append("is_card", "1");
        paymentData.append("is_card_one_time", "1");
        paymentData.append("card_type", data?.ssl_card_short_description);
        paymentData.append("token", data?.ssl_token);
        paymentData.append("salestax", "0");
      } else {
        paymentData.append("credit_card_number", data?.cardNumber);
        paymentData.append("card_type", data?.cardType);
        paymentData.append("expiration", data?.cardExpDate);
        paymentData.append("is_card_one_time", "1");
      }
    }
    if (debitType == "bank_account") {
      paymentData.append("bank_account_number", data?.accountNumber?.slice(-4) || "");
      paymentData.append("is_card", "0");
      paymentData.append("routing_number", data?.routingNumber);
    }

    dispatch(
      oneTimePayment(
        paymentData,
        () => { successScreenClose(); },
        undefined,
        companyInfo?.company?.alias,
           (toast) => {

successScreenClose(toast)
        }
      )
    );
  };

  const successScreenClose = (toast?:string) => {
    setIsDirty(false);
    setActiveStep(0);
    setFormData({
      accountNo: "",
      invoiceAmount: "",
      name: "",
      email: "",
      amountToPay: "",
      convenienceFee: "",
      totalPayment: "",
      paymentType: "card",
      street: "",
    });
    navigateTo("/auth-card-redirect", {
      state: { alias: companyInfo?.company?.alias,
          message:toast

       },
    });
  };
const handleBackToLogin=()=>{
      navigateTo(`/login-${companyInfo?.company?.alias}`, 

    );

}
  // replaces onModalClose — navigates back instead of closing a dialog
  const handleGoBack = () => {
    if (!confirmIfDirty()) return;
    setIsDirty(false);
    setActiveStep(0);
    setFormData({
      accountNo: "",
      invoiceAmount: "",
      name: "",
      email: "",
      amountToPay: "",
      convenienceFee: "",
      totalPayment: "",
      paymentType: "card",
      street: "",
    });
    navigateTo(-1); // go back to previous route
  };

  useEffect(() => {
    const formdata = new FormData();
    formdata.append("acl_role_id", "4");
    formdata.append("company_id", companyInfo?.company?.id);
    formdata.append("alias", companyInfo?.company?.alias);
    if (activeStep == 2) {
      dispatch(
        getPaymentProcessorDetails(formdata, false, undefined, () => {})
      );
      formdata.append("customer_id", customerDetails?.id);
      dispatch(getConvenienceFee(formdata));
    }
  }, [activeStep]);

  const tooltipSx = {
    componentsProps: {
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
    },
  };

  const renderStepContent = (step) => {
    switch (step) {
    case 0:
  return (
    <>
      {/* Account Number */}
      <Box mb={2}>
        
        <FormControl fullWidth error={!!errors.accountNo}>
          <InputLabel
            shrink={accountNoFocused || Boolean(formData.accountNo)}
            sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
          >
Account No *
          </InputLabel>
          <OutlinedInput
            notched={accountNoFocused || Boolean(formData.accountNo)}
            label="Account No *"
            value={formData.accountNo}
            onChange={handleChange("accountNo")}
            onFocus={() => setAccountNoFocused(true)}
            onBlur={() => setAccountNoFocused(false)}
            startAdornment={
              <User size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
            }
           
          />
          {errors.accountNo && (
            <FormHelperText>{errors.accountNo}</FormHelperText>
          )}
        </FormControl>
      </Box>

      {/* Original Invoice Amount */}
      <Box mb={2}>
      
        <FormControl fullWidth error={!!errors.invoiceAmount}>
          <InputLabel
            shrink={invoiceFocused || Boolean(formData.invoiceAmount)}
            sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
          >
             Original invoice amount *
          </InputLabel>
          <OutlinedInput
            notched={invoiceFocused || Boolean(formData.invoiceAmount)}
            label="Original invoice amount *"
            value={formData.invoiceAmount}
            onChange={handleChange("invoiceAmount")}
            onFocus={() => setInvoiceFocused(true)}
            onBlur={() => setInvoiceFocused(false)}
            startAdornment={
              <CurrencyDollar size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
            }
            endAdornment={
              <InputAdornment position="end">
                <Tooltip
                  title={
                    <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
                      Enter the amount from your original invoice for this billing
                      period. Do not include any recently added late fees.
                    </span>
                  }
                  placement="top"
                  arrow
                  {...tooltipSx}
                >
                  <IconButton edge="end" size="small">
                    <Question size={20} color="#5dade2" weight="fill" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            }
          />
          {errors.invoiceAmount && (
            <FormHelperText>{errors.invoiceAmount}</FormHelperText>
          )}
        </FormControl>
      </Box>

      {/* Info box */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          backgroundColor: "#eff6ff",
          border: "1px solid #dbeafe",
          borderRadius: "10px",
          px: 2,
          py: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
          //   width: 32,
          //   height: 32,
          //   borderRadius: "50%",
          //   backgroundColor: colors.blue,
            display: "flex",
            alignItems: "center",
          //   justifyContent: "center",
          //   flexShrink: 0,
          }}
        >
          {/* <Info size={18} color="#fff" weight="fill" /> */}
          <Info
                    size={20}
                    color={colors.blue}
                    weight="regular"
                    style={{ flexShrink: 0, marginTop: 4 }}
                  />
        </Box>
        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
          Please enter the original invoice amount exactly as shown on your bill.
        </Typography>
      </Box>

      {/* Buttons */}
      <Box display="flex" justifyContent="space-between"
       sx={{
    flexWrap: { xs: "wrap", sm: "nowrap" },
    gap: 1.5,
  }}
      >
        <MUIButton
          variant="outlined"
          onClick={handleBackToLogin}
          startIcon={<ArrowLeft size={18} />}
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            height: "44px",
            px: 3,
            color: colors.blue,
            borderColor: colors.blue,
            backgroundColor: "#fff",
            fontWeight: 600,
          }}
        >
          Back to Login
        </MUIButton>

        <Button
          type="button"
          variant="contained"
          onClick={handleRetrieveBill}
          loading={accountLoading}
          textTransform="none"
          style={{
            borderRadius: "12px",
            height: "44px",
            paddingLeft: "24px",
            paddingRight: "24px",
            backgroundColor: colors.blue,
            fontWeight: 600,
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors["blue.3"])}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.blue)}
        >
          <Receipt size={18} style={{ marginRight: 8 }} weight="regular" />
          Retrieve Bill
        </Button>
      </Box>
    </>
  );
   case 1:
  return (
    <>
      {/* Info text */}
      <Typography variant="body2" color="text.secondary" mb={2}>
        Enter your email address to receive a payment confirmation.
      </Typography>

      {/* Account info box */}
      <Box
        sx={{
          backgroundColor: "#f8fafc",
          border: "1px solid #eaecf0",
          borderRadius: "10px",
          px: 2,
          py: 1.5,
          mb: 3,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          rowGap: 0.5,
        }}
      >
        <Typography sx={{ pr: 2, fontWeight: 600, whiteSpace: "nowrap" }}>
          Account No:
        </Typography>
        <Typography sx={{ wordBreak: "break-word" }}>
          {formData.accountNo}
        </Typography>
        <Typography sx={{ pr: 2, fontWeight: 600, whiteSpace: "nowrap" }}>
          Customer:
        </Typography>
        <Typography sx={{ wordBreak: "break-word" }}>
          {formData.name}
        </Typography>
      </Box>

      {/* Email */}
      <Box mb={2}>
        <FormControl fullWidth error={!!errors.email}>
          <InputLabel
            shrink={emailFocused || Boolean(formData.email)}
            sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
          >
            Send Payment Confirmation to *
          </InputLabel>
          <OutlinedInput
            notched={emailFocused || Boolean(formData.email)}
            label="Send Payment Confirmation to *"
            value={formData.email}
            onChange={handleChange("email")}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            startAdornment={
              <EnvelopeSimple size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
            }
          />
          {errors.email && (
            <FormHelperText>{errors.email}</FormHelperText>
          )}
        </FormControl>
      </Box>

      {/* Due Amount + Preview Invoice */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="body2" fontWeight={600}>
          Due Amount: <span style={{ color: colors.blue }}>${customerDetails.balance}</span>
        </Typography>
        <Typography
          variant="body2"
          sx={{ textDecoration: "underline", cursor: "pointer", color: colors.blue }}
          onClick={handlePreviewInvoice}
        >
          PREVIEW INVOICE
        </Typography>
      </Box>

      {/* Amount To Pay */}
      <Box mb={3}>
        <Tooltip
          title={
            companyInfo?.company?.allow_partial_payments == 0 &&
            companyInfo?.company?.allow_overpayments == 0
              ? "Over payments are not allowed at this time. And also Partial payments are not allowed"
              : companyInfo?.customer?.is_payments_blocked == 1
              ? companyInfo?.block_individual_customer_pay_text ?? "Payments are not allowed at this time."
              : ""
          }
          {...tooltipSx}
        >
          <FormControl fullWidth error={!!errors.amountToPay}>
            <InputLabel
              shrink={amountFocused || Boolean(formData.amountToPay)}
              sx={{ "&:not(.MuiInputLabel-shrink)": { left: "36px" } }}
            >
              Amount To Pay *
            </InputLabel>
            <OutlinedInput
              notched={amountFocused || Boolean(formData.amountToPay)}
              label="Amount To Pay *"
              value={formData.amountToPay}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              disabled={
                companyInfo?.company?.allow_partial_payments == 0 ||
                companyInfo?.company?.allow_overpayments == 0
              }
              onChange={(e) => {
                const value = e.target.value;
                if (Number(value) < 0) { toast.warn("Amount should be more than 0"); return; }
                if (companyInfo?.company?.allow_overpayments == 0 && Number(value) > customerDetails.balance) {
                  toast.warn("Over payments are not allowed at this time."); return;
                }
                if (companyInfo?.company?.allow_partial_payments == 0 && Number(value) < customerDetails.balance) {
                  toast.warn("Partial payments are not allowed at this time."); return;
                }
                handleChange("amountToPay")(e);
              }}
              startAdornment={
                <CurrencyDollar size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
              }
            />
            {errors.amountToPay && (
              <FormHelperText>{errors.amountToPay}</FormHelperText>
            )}
          </FormControl>
        </Tooltip>
      </Box>

      {/* Buttons */}
      <Box display="flex" justifyContent="space-between"
       sx={{
    flexWrap: { xs: "wrap", sm: "nowrap" },
    gap: 1.5,
  }}
      >
        <MUIButton
          variant="outlined"
          onClick={handleBack}
          startIcon={<ArrowLeft size={18} />}
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            height: "44px",
            px: 3,
            color: colors.blue,
            borderColor: colors.blue,
            backgroundColor: "#fff",
            fontWeight: 600,
          }}
        >
          Back
        </MUIButton>

        <Button
          type="button"
          variant="contained"
          onClick={handleNext}
          textTransform="none"
          style={{
            borderRadius: "12px",
            height: "44px",
            paddingLeft: "24px",
            paddingRight: "24px",
            backgroundColor: colors.blue,
            fontWeight: 600,
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors["blue.3"])}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.blue)}
        >
          <CreditCard size={18} style={{ marginRight: 8 }} weight="regular" />
          Enter Payment Method
        </Button>
      </Box>
    </>
  );
      case 2:
  return (
    <>
      {/* Name & Email info row */}
      <Box
        sx={{
          backgroundColor: "#f8fafc",
          border: "1px solid #eaecf0",
          borderRadius: "10px",
          px: 2,
          py: 1.5,
          mb: 2,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          rowGap: 0.5,
        }}
      >
        <Typography sx={{ pr: 2, fontWeight: 600, whiteSpace: "nowrap" }}>Name:</Typography>
        <Typography>{formData.name}</Typography>
        <Typography sx={{ pr: 2, fontWeight: 600, whiteSpace: "nowrap" }}>Email:</Typography>
        <Typography>{formData.email}</Typography>
      </Box>

      {/* Payment Summary */}
      <Box
        sx={{
          backgroundColor: "#eff6ff",
          border: "1px solid #dbeafe",
          borderRadius: "10px",
          px: 2,
          py: 2,
          mb: 2,
        }}
      >
        <Typography variant="body2" fontWeight={700} color={colors.blue} mb={1.5}>
          Payment Summary
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Payment Amount</Typography>
          <Typography variant="body2" fontWeight={600}>
            ${Number(formData.amountToPay).toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">Convenience Fee</Typography>
          <Typography variant="body2" fontWeight={600}>
            ${Number(formData.convenienceFee).toFixed(2)}
          </Typography>
        </Box>

        <Box
          sx={{
            borderTop: "1px solid #dbeafe",
            mt: 1,
            pt: 1,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" fontWeight={700}>Total Payment</Typography>
          <Typography variant="body2" fontWeight={700} color={colors.blue}>
            ${Number(formData.totalPayment).toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Select Payment Type */}
      <Box
        sx={{
          border: "1px solid #eaecf0",
          borderRadius: "10px",
          px: 2,
          py: 1.5,
          mb: 2,
        }}
      >
        <Typography variant="body2" fontWeight={700} mb={1}>
          Select Payment Type
        </Typography>
        <RadioGroup
          value={formData.paymentType}
          onChange={handleChange("paymentType")}
          sx={{ display: "flex", flexDirection: "row", gap: 1 }}
        >
          <FormControlLabel value="card" control={<Radio />} label="Credit Card" />
          <FormControlLabel
            value="bank_account"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1} position="relative">
                Bank Account
                <Box
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  sx={{ position: "relative", display: "inline-block", top: 3 }}
                >
                  <Question size={20} color="#5dade2" weight="fill" />
                  {hovered && (
                    <Box
                      component="img"

                                                src={`${BASE_URL}/resources/front/images/bankaccount-help.png`}
                      
                      alt="Help"
                      sx={{
                        position: "absolute",
                        top: "30px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 350,
                        height: 350,
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 999,
                      }}
                    />
                  )}
                </Box>
              </Box>
            }
          />
        </RadioGroup>
        {errors.paymentType && (
          <Typography color="error" variant="caption">
            {errors.paymentType}
          </Typography>
        )}
      </Box>

      {/* Payment Iframe */}
      <PaymentIframe
        type={formData.paymentType === "card" ? "card" : "account"}
        onSuccess={(res) => handleSaveDetails(res, companyInfo, formData, customerDetails)}
        oneTimePayment={formData}
        convenience_fee={String(formData.convenienceFee || 0)}
        amount={(Number(formData.amountToPay) || 0).toFixed(2)}
        amountRequired={true}
        customerDetails={customerDetails}
      />

      {/* Back button */}
      <Box display="flex" mt={2}>
        <MUIButton
          variant="outlined"
          onClick={handleBack}
          startIcon={<ArrowLeft size={18} />}
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            height: "44px",
            px: 3,
            color: colors.blue,
            borderColor: colors.blue,
            backgroundColor: "#fff",
            fontWeight: 600,
          }}
        >
          Back
        </MUIButton>
      </Box>
    </>
  );
      default:
        return null;
    }
  };

  const [previewInvoicePdf, setPdfPreviewInvocie] = useState(false);

  const handlePreviewInvoice = async () => {
    if (!oneTimeData) return;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      try {
        const blob = await pdf(<OneTimePdf invoiceDetails={oneTimeData as any} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${oneTimeData?.last_bill?.invoice_number || "file"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("PDF Download Error:", error);
      }
      return;
    }
    setPdfPreviewInvocie(true);
  };
const [accountNoFocused, setAccountNoFocused] = React.useState(false);
const [invoiceFocused, setInvoiceFocused] = React.useState(false);

const [emailFocused, setEmailFocused] = React.useState(false);
const [amountFocused, setAmountFocused] = React.useState(false);
  return (
    // ── Full-page screen wrapper ──────────────────────────────────────────────
    <Box >

 

      {/* ── Card container (replaces Dialog box) ───────────────────────────── */}
      <Box
    
      >

<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
  <Box
    sx={{
      width: 64,
      height: 64,
      borderRadius: "50%",
      backgroundColor: "#e8f0fb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
    }}
  >
    <CreditCard size={30} color={colors.blue} weight="regular" />
    <Box
      sx={{
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: "50%",
        backgroundColor: "#e8f0fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CheckCircle size={14} color={colors.blue} weight="fill" />
    </Box>
  </Box>
  <Box>
    <Typography variant="h5" fontWeight={700}>
      Pay as Guest
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Pay your bill securely in just a few simple steps.
    </Typography>
  </Box>
</Box>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<CustomConnector topOffset={15} />}
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

        {renderStepContent(activeStep)}
      </Box>

      <Backdrop
        open={accountLoading && activeStep === 2}
        style={{ zIndex: 1300, color: "#fff" }}
      >
        <CircularProgress color="success" />
      </Backdrop>

      {previewInvoicePdf && (
        <CustomModal
          open={previewInvoicePdf}
          onClose={() => setPdfPreviewInvocie(false)}
          id={oneTimeData?.last_bill?.id}
          oneTime={true}
        />
      )}
    </Box>
  );
}