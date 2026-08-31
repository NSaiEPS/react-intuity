import React, { useEffect, useState } from "react";
import {
  getConvenienceFee,
  getPaymentProcessorDetails,
  guestPaymentRequest,
  oneTimePayment,
  setOneTimePaymentInfo,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors, getPaymentMethodType, maskValue } from "@/utils";
import PaymentSummaryModal from "../dashboard/overview/payment-summary-modal";
// @react-pdf/renderer is 1.46 MB — loaded only when user requests a PDF preview
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
// OneTimePdf & CustomModal pull in @react-pdf/renderer — lazy load so Pay Now renders instantly
const CustomModal = React.lazy(() => import("../dashboard/layout/invoice-pdf-modal"));
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

const SESSION_KEY = "guest-payment-state";

type PersistedState = {
  activeStep: number;
  formData: {
    accountNo: string;
    invoiceAmount: string;
    name: string;
    email: string;
    amountToPay: string;
    convenienceFee: string;
    totalPayment: string;
    paymentType: string;
    street: string;
    cardType?: string;
  };
  customerDetails: Record<string, any>;
  oneTimeData: any;
};

function loadSnapshot(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

export default function OneTimePaymentScreen() {
  const snapshot = React.useRef(loadSnapshot());

  const [isDirty, setIsDirty] = useState(false);
  // Never restore to step 2 — the payment iframe needs a fresh processor API call
  const [activeStep, setActiveStep] = useState(() => {
    const saved = snapshot.current?.activeStep ?? 0;
    return saved === 2 ? 0 : saved;
  });
  const dispatch = useDispatch();

  const companyInfo = useSelector(
    (state: RootState) => state.Account.companyInfo
  );
  const accountLoading = useSelector(
    (state: RootState) => state.Account.accountLoading
  );
  const oneTimeData = useSelector(
    (state: RootState) => state.Account.oneTimePaymentInfo
  );

  const [formData, setFormData] = useState(
    () =>
      snapshot.current?.formData ?? {
        accountNo: "",
        invoiceAmount: "",
        name: "",
        email: "",
        amountToPay: "",
        convenienceFee: "",
        totalPayment: "",
        paymentType: "card",
        street: "",
        cardType: "",
      }
  );
  const [customerDetails, setCustomerDetails] = useState<any>(
    () => snapshot.current?.customerDetails ?? {}
  );
  const [cardBankDetails, setCardBankDetails] = useState<any>(null);

  // On mount: restore oneTimeData into Redux if we have a snapshot
  useEffect(() => {
    if (snapshot.current?.oneTimeData) {
      dispatch(setOneTimePaymentInfo(snapshot.current.oneTimeData));
    }
  }, []);

  // Persist progress to sessionStorage whenever relevant state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ activeStep, formData, customerDetails, oneTimeData })
      );
    } catch {
      // sessionStorage quota exceeded — ignore
    }
  }, [activeStep, formData, customerDetails, oneTimeData]);

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

  const extractFeeFromResponse = (resData: any): number => {
    if (typeof resData === "number") return resData;
    if (typeof resData === "string") return parseFloat(resData) || 0;
    if (resData && typeof resData === "object") {
      const val = resData.convenience_fee ?? resData.fee_amount ?? resData.convenienceFee ?? resData.fee ?? 0;
      return parseFloat(String(val)) || 0;
    }
    return 0;
  };

  useEffect(() => {
    if (activeStep !== 2) return;

    const amountNum = parseFloat(formData.amountToPay || "0");
    if (amountNum <= 0) return;

    const paymentMethodType = getPaymentMethodType({
      paymentType: formData.paymentType,
      cardType: formData.cardType,
    });

    const payload = {
      acl_role_id: 4,
      customer_id: customerDetails?.id,
      amount: amountNum.toFixed(2),
      payment_method_type: paymentMethodType,
      is_one_time_payment: true,
    };

    dispatch(
      getConvenienceFee(payload, (resData) => {
        const feeNum = extractFeeFromResponse(resData);
        const feeStr = feeNum.toFixed(2);
        const totalStr = (feeNum + amountNum).toFixed(2);

        setFormData((prev) => ({
          ...prev,
          convenienceFee: feeStr,
          totalPayment: totalStr,
        }));

        const worldPlayDetails = {
          account_number: formData.accountNo,
          invoice_amount: formData.invoiceAmount,
          name: formData.name,
          email: formData.email,
          amount: amountNum.toFixed(2),
          convenienceFee: feeStr,
          totalPayment: totalStr,
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
      })
    );
  }, [activeStep, formData.amountToPay, formData.paymentType, formData.cardType, customerDetails?.id, dispatch]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
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
      const amountVal = Number(formData.amountToPay);
      if (!formData.amountToPay || isNaN(amountVal) || amountVal <= 0) {
        toast.warn("Amount should be more than 0");
        newErrors.amountToPay = "Amount should be more than 0";
      } else if (
        companyInfo?.company?.allow_overpayments == 0 &&
        amountVal > customerDetails.balance
      ) {
        toast.warn("Over payments are not allowed at this time.");
        newErrors.amountToPay = "Over payments are not allowed at this time.";
      } else if (
        companyInfo?.company?.allow_partial_payments == 0 &&
        amountVal < customerDetails.balance
      ) {
        toast.warn("Partial payments are not allowed at this time.");
        newErrors.amountToPay = "Partial payments are not allowed at this time.";
      }
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
        handleFailure
      )
    );
  };

  const handleFailure = (data, noToast = false) => {
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

  const successScreenClose = (toast?: string) => {
    sessionStorage.removeItem(SESSION_KEY);
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
      cardType: "",
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
    sessionStorage.removeItem(SESSION_KEY);
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
      cardType: "",
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
                  Account Number *

          </InputLabel>
          <OutlinedInput
            notched={accountNoFocused || Boolean(formData.accountNo)}
            label="Account Number *"
            value={formData.accountNo}
            onChange={handleChange("accountNo")}
            onFocus={() => setAccountNoFocused(true)}
            onBlur={() => setAccountNoFocused(false)}
            startAdornment={
              <User size={18} color="#9aa5b4" weight="regular" style={{ marginRight: 8 }} />
            }
               endAdornment={
                    <InputAdornment position="end">
                      <Tooltip
                        title={
                          <span style={{ fontSize: '14px', lineHeight: 1.4 }}>
                            Please locate your account number on your statement. If you received a “Utility Bill Ready”
                            email notification, your account number can be found at the top of the email content.
                          </span>
                        }
                        placement="top"
                        arrow
                        enterTouchDelay={0}
                        leaveTouchDelay={3000}
                        {...tooltipSx}
                      >
                        <IconButton size="small">
                          <Question size={20} color="#90caf9" weight="fill" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
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
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRetrieveBill(); } }}
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
                  enterTouchDelay={0}
                  leaveTouchDelay={3000}
                  {...tooltipSx}
                >
                  <IconButton  size="small">
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
          Due Amount: <span style={{ color: colors.blue }}>
            $
            {/* {customerDetails.balance} */}
               {Number(customerDetails.balance).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </span>
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
          enterTouchDelay={0}
          leaveTouchDelay={3000}
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
              // value={formData.amountToPay}
                value={
                      amountFocused
                        ? formData.amountToPay
                        : formData.amountToPay
                          ? Number(formData.amountToPay).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ''
                    }
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
              disabled={
                companyInfo?.company?.allow_partial_payments == 0 ||
                companyInfo?.company?.allow_overpayments == 0
              }
              onChange={handleChange("amountToPay")}
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
              <Box display="flex" alignItems="center" gap={1}>
                Bank Account
                <Tooltip
                  title={
                    <Box
                      component="img"
                      src={`${BASE_URL}/resources/front/images/bankaccount-help.png`}
                      alt="Bank account help"
                      sx={{ width: "100%", display: "block", borderRadius: 1 }}
                    />
                  }
                  placement="bottom"
                  arrow
                  enterTouchDelay={0}
                  leaveTouchDelay={5000}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "#fff",
                        border: "1px solid #d0cfcf",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        maxWidth: "min(90vw, 360px)",
                        p: 1,
                        "& .MuiTooltip-arrow": {
                          color: "#fff",
                          "&::before": { border: "1px solid #d0cfcf" },
                        },
                      },
                    },
                  }}
                >
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                    <Question size={20} color="#5dade2" weight="fill" />
                  </Box>
                </Tooltip>
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
        onSuccess={(res: any) => setCardBankDetails(res)}
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
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = isIOS || /Android/i.test(navigator.userAgent);

    if (isMobile) {
      // iOS: open the tab synchronously while still inside the user-gesture.
      // After await the gesture is gone and Safari blocks window.open.
      const newTab = isIOS ? window.open('', '_blank') : null;
      try {
        const [{ pdf }, { default: OneTimePdf }] = await Promise.all([
          import('@react-pdf/renderer'),
          import('../dashboard/layout/one-time-invoice'),
        ]);
        const blob = await pdf(<OneTimePdf invoiceDetails={oneTimeData as any} />).toBlob();
        const url = URL.createObjectURL(blob);

        if (isIOS) {
          if (newTab) {
            newTab.location.href = url;
          } else {
            // Popup was blocked — fall back to replacing current tab
            window.location.href = url;
          }
        } else {
          // Android: download attribute works on blob URLs
          const link = document.createElement('a');
          link.href = url;
          link.download = `invoice-${oneTimeData?.last_bill?.invoice_number || 'file'}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('PDF Download Error:', error);
        newTab?.close();
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
        <React.Suspense fallback={<Backdrop open sx={{ zIndex: 1400, color: "#fff" }}><CircularProgress /></Backdrop>}>
          <CustomModal
            open={previewInvoicePdf}
            onClose={() => setPdfPreviewInvocie(false)}
            id={oneTimeData?.last_bill?.id}
            oneTime={true}
          />
        </React.Suspense>
      )}

      {Boolean(cardBankDetails) && (
        <PaymentSummaryModal
          open={Boolean(cardBankDetails)}
          onClose={() => {
            setCardBankDetails(null);
          }}
          onPay={() => {
            const details = cardBankDetails;
            setCardBankDetails(null);
            handleSaveDetails(details, companyInfo, formData, customerDetails);
          }}
          payText="Pay Now"
          amount={Number(formData.amountToPay || 0)}
          fee={Number(formData.convenienceFee || 0)}
          cardType={
            cardBankDetails?.cardType ??
            cardBankDetails?.ssl_card_short_description ??
            cardBankDetails?.brand ??
            (formData.paymentType === "card" ? "Credit Card" : "Bank Account")
          }
          cardLast4={
            cardBankDetails?.cardNumber
              ? (String(cardBankDetails.cardNumber).includes("*")
                  ? cardBankDetails.cardNumber
                  : maskValue(cardBankDetails.cardNumber))
              : cardBankDetails?.ssl_card_number
              ? cardBankDetails.ssl_card_number
              : cardBankDetails?.accountNumber
              ? (String(cardBankDetails.accountNumber).includes("*")
                  ? cardBankDetails.accountNumber
                  : maskValue(cardBankDetails.accountNumber))
              : cardBankDetails?.last4
              ? maskValue(cardBankDetails.last4)
              : ""
          }
        />
      )}
    </Box>
  );
}