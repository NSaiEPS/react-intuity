import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  stepConnectorClasses,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  IconButton,
  InputAdornment,
  Tooltip,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { CustomConnector, CustomStepIcon } from "./sign-up-form";
import { Button } from "nsaicomponents";
import { calculatePaymentAmount, colors } from "@/utils";
import { X } from "@phosphor-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import {
  getConvenienceFee,
  getPaymentProcessorDetails,
  guestPaymentRequest,
  oneTimePayment,
} from "@/state/features/accountSlice";
import { Question } from "@phosphor-icons/react";
import { toast } from "react-toastify";
import PaymentIframe from "../CommonComponents/PaymentIframeModal";

const steps = ["Retrieve Bill", "Confirm Payment", "Select Payment Method"];

export default function OneTimePaymentModal({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const [iframeLoading, setIframeLoading] = useState(true);

  const companyInfo = useSelector(
    (state: RootState) => state.Account.companyInfo
  );
  const accountLoading = useSelector(
    (state: RootState) => state.Account.accountLoading
  );

  console.log(companyInfo, "companyInfo");
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

  const [errors, setErrors] = useState<FormErrors>({}); // Track validation errors

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: "" }); // clear error once user types
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
  }, [formData.amountToPay, convenienceFee]);

  // Validation per step
  const validateStep = () => {
    let newErrors: any = {};
    if (activeStep === 0) {
      if (!formData.accountNo) {
        newErrors.accountNo = "Account No. is required";
      } else if (!/^\d+(\.\d+)?$/.test(formData.accountNo)) {
        newErrors.accountNo = "Only numbers allowed";
      }

      // Invoice Amount
      if (!formData.invoiceAmount) {
        newErrors.invoiceAmount = "Invoice Amount is required";
      } else if (!/^\d+(\.\d+)?$/.test(formData.invoiceAmount)) {
        newErrors.invoiceAmount = "Only numbers or decimals allowed";
      }
    }
    if (activeStep === 1) {
      if (Number(formData.amountToPay) === 0 || !formData.amountToPay)
        newErrors.amountToPay = "Amount to Pay is required";
      if (!formData.name) newErrors.name = "Name  is required";
      if (!formData.email) newErrors.email = "Email  is required";
      if (Number(formData.amountToPay) > customerDetails.balance)
        newErrors.amountToPay = `Amount can't be greater than the  Due Amount: $${customerDetails.balance}`;
    }
    if (activeStep === 2) {
      if (!formData.paymentType)
        newErrors.paymentType = "Please select a payment method";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleRetrieveBill = () => {
    if (!formData.accountNo) {
      setErrors({ accountNo: "Account No. is required" });
      return;
    } else if (!/^\d+(\.\d+)?$/.test(formData.accountNo)) {
      setErrors({ accountNo: "Only numbers allowed" });
      return;
    }
    if (!formData.invoiceAmount) {
      setErrors({ invoiceAmount: "Invoice Amount is required" });
      return;
    } else if (!/^\d+(\.\d+)?$/.test(formData.invoiceAmount)) {
      setErrors({ invoiceAmount: "Only numbers allowed" });
      return;
    }
    const paymentData = new FormData();
    paymentData.append("account_number", formData.accountNo);
    paymentData.append("invoice_amount", formData.invoiceAmount);
    paymentData.append("success_authenticate", "0");
    paymentData.append("company_id", companyInfo?.company?.id);
    paymentData.append("company_alias", companyInfo?.company?.alias);
    // invoice_amount:2032.85
    // success_authenticate:0
    // company_id:4
    // company_alias:RiverPark-1
    dispatch(
      guestPaymentRequest(paymentData, companyInfo?.company?.alias, (res) => {
        console.log(res, "companyInfo");
        setCustomerDetails(res);
        setFormData((prev) => ({
          ...prev,

          name: res?.customer_name,
          email: res?.email,
          amountToPay: "0",
          convenienceFee: "0",
          totalPayment: "0",
          street: res?.service_address,
        }));
        handleNext();
      })
    );
  };

  // useEffect(() => {
  //   const handleMessage = (event) => {
  //     if (event?.data?.custId) {
  //       console.log(event?.data);
  //       handleSaveDetails(event.data, companyInfo, formData, customerDetails);
  //     }
  //   };

  //   window.addEventListener("message", handleMessage);

  //   return () => window.removeEventListener("message", handleMessage);
  // }, [companyInfo, formData, customerDetails]);
  console.log(formData, "formData");

  const handleSaveDetails = (data, companyInfo, formData, customerDetails) => {
    if (data?.error) {
      toast.error(
        data?.error ? data?.error : "Try again something went wrong!"
      );

      return;
    }
    console.log(companyInfo, "companyInfo");
    const debitType = data?.cardNumber ? "card" : "bank_account";
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

    paymentData.append("token", data?.token);
    paymentData.append("is_one_time", "1");
    // paymentData.append("amount", formData.amountToPay);
    // paymentData.append("convenienceFee", formData.convenienceFee);

    paymentData.append("amount", Number(formData.amountToPay).toFixed(2));
    paymentData.append(
      "convenienceFee",
      Number(formData.convenienceFee).toFixed(2)
    );

    if (debitType === "card") {
      paymentData.append("credit_card_number", data?.cardNumber);
      paymentData.append("card_type", data?.cardType);
      paymentData.append("expiration", data?.cardExpDate);
      paymentData.append("is_card_one_time", "1");
    }
    if (debitType == "bank_account") {
      paymentData.append("bank_account_number", data?.accountNumber);
      paymentData.append("routing_number", data?.routingNumber);
      paymentData.append(
        "account_type",
        data?.accountType === "PC"
          ? "Personal Checking"
          : data?.accountType === "PS"
          ? "Personal Savings"
          : data?.accountType === "BC"
          ? "Business Checking"
          : data?.accountType === "BS"
          ? "Business Savings"
          : data?.accountType === "GL"
          ? "General Ledger"
          : " Other"
      );
    }
    //    "account_number:0125
    // invoice_amount:62.99
    // amount:1.00
    // company_id:2
    // company_alias:cape-royale1
    // customer_id:379
    // success_authenticate:1
    // name:JORDAN, JOAN H
    // email:jordan@gmail.com
    // billing_id:26323
    // token:c662e0ea1cd34584a54c53f7276044ab
    // credit_card_number:1111
    // expiration:1131
    // is_one_time:1
    // is_card:1
    // convenienceFee:0.04"

    dispatch(
      oneTimePayment(paymentData, () => {
        onModalClose();
      })
    );
  };
  const onModalClose = () => {
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
    onClose();
  };
  useEffect(() => {
    //     "acl_role_id:4
    // company_id:2
    // alias:cape-royale1"
    const formdata = new FormData();
    formdata.append("acl_role_id", "4");
    formdata.append("company_id", companyInfo?.company?.id);
    formdata.append("alias", companyInfo?.company?.alias);
    if (activeStep == 2) {
      dispatch(
        getPaymentProcessorDetails(
          undefined,
          formdata,
          false,
          undefined,
          () => {}
        )
      );
      formdata.append("customer_id", customerDetails?.id);

      // const convenienceFeeFormdata = new FormData();
      // convenienceFeeFormdata.append("acl_role_id", stored?.body?.acl_role_id);
      // convenienceFeeFormdata.append("customer_id", stored?.body?.customer_id);

      dispatch(getConvenienceFee(undefined, formdata));
    }
  }, [activeStep]);
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              fullWidth
              label="Account No."
              value={formData.accountNo}
              onChange={handleChange("accountNo")}
              error={!!errors.accountNo}
              helperText={errors.accountNo}
              sx={{ mb: 2 }}
            />
            {/* <TextField
              fullWidth
              label="Original Invoice Amount"
              value={formData.invoiceAmount}
              onChange={handleChange("invoiceAmount")}
              error={!!errors.invoiceAmount}
              helperText={errors.invoiceAmount}
              sx={{ mb: 2 }}
            /> */}

            <TextField
              fullWidth
              label="Original Invoice Amount"
              value={formData.invoiceAmount}
              onChange={handleChange("invoiceAmount")}
              error={!!errors.invoiceAmount}
              helperText={errors.invoiceAmount}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        <span style={{ fontSize: "14px", lineHeight: 1.4 }}>
                          Enter the amount from your original invoice for this
                          billing period. Do not include any recently added late
                          fees. Do not reduce the invoice amount due to any
                          payments made since you received the initial bill.
                        </span>
                      }
                      placement="top"
                      arrow
                    >
                      <IconButton edge="end" size="small">
                        <Question size={20} color="#5dade2" weight="fill" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="button"
              variant="contained"
              onClick={handleRetrieveBill}
              loading={accountLoading}
              style={{
                borderRadius: "12px",
                height: "41px",
                width: "100%",
                backgroundColor: colors.blue,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = colors["blue.3"])
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = colors.blue)
              }
            >
              Retrieve Bill
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <TextField
              fullWidth
              label="Name: "
              value={formData.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email: "
              value={formData.email}
              onChange={handleChange("email")}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
            />
            {/* <Typography>Name: {formData.name}</Typography>
            <Typography>Email: {formData.email}</Typography> */}
            <Typography mb={2}>
              Due Amount: ${customerDetails.balance}
            </Typography>
            <TextField
              fullWidth
              label="Amount To Pay"
              value={formData.amountToPay}
              onChange={handleChange("amountToPay")}
              error={!!errors.amountToPay}
              helperText={errors.amountToPay}
              sx={{ mb: 2 }}
            />
            <Box display="flex" justifyContent="space-between">
              <Button
                onClick={handleBack}
                variant="outlined"
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  borderRadius: "12px",
                  height: "41px",
                }}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                style={{
                  borderRadius: "12px",
                  height: "41px",
                  width: "115",
                  backgroundColor: colors.blue,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = colors["blue.3"])
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.blue)
                }
              >
                Enter Payment Method
              </Button>
            </Box>
          </>
        );
      case 2:
        return (
          <>
            <Typography>Name: {formData.name}</Typography>
            <Typography>Email: {formData.email}</Typography>
            <Typography mt={2}>Amount: ${formData.amountToPay}</Typography>
            <Typography>
              Additional Convenience Fee: ${formData.convenienceFee}
            </Typography>
            <Typography>
              Total Payment: $
              {parseFloat(Number(formData.totalPayment).toFixed(2))}
            </Typography>

            <Typography sx={{ mt: 2 }}>Select Payment Type</Typography>
            <RadioGroup
              value={formData.paymentType}
              onChange={handleChange("paymentType")}
            >
              <FormControlLabel
                value="card"
                control={<Radio />}
                label="Credit Card"
              />
              <FormControlLabel
                value="bank_account"
                control={<Radio />}
                label="Bank Account"
              />
            </RadioGroup>
            {errors.paymentType && (
              <Typography color="error" variant="caption">
                {errors.paymentType}
              </Typography>
            )}

            {/* {iframeLoading && (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={500}
                width={500}
                sx={{ border: "1px solid #ccc", mb: 2 }}
              >
                Loading...
              </Box>
            )}
            <div
              className="projects-section-line"
              style={{ marginTop: "20px" }}
            >
              {!iframeLoading && (
                <Typography
                  variant="body1"
                  align="center"
                  sx={{ color: "red", fontWeight: "bold" }}
                >
                  ⚠️ WARNING! Only click this button ONCE!
                </Typography>
              )}
              <iframe
                id="iFrameBA"
                name="iFrameBA"
                src={iframeUrlForPayment}
                scrolling="no"
                width="500"
                height="500"
                frameBorder="0"
                title="ICG Payment"
                onLoad={() => setIframeLoading(false)}
              ></iframe>
            </div> */}

            <PaymentIframe
              type={formData.paymentType == "card" ? "card" : "account"}
              onSuccess={(res) =>
                handleSaveDetails(res, companyInfo, formData, customerDetails)
              }
              oneTimePayment={formData}
            />

            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button
                onClick={handleBack}
                variant="outlined"
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  borderRadius: "12px",
                  height: "41px",
                }}
              >
                Back
              </Button>
              {/* <Button
                variant="contained"
                onClick={() => {
                  if (validateStep()) onClose();
                }}
                style={{
                  borderRadius: "12px",
                  height: "41px",
                  width: "115",
                  backgroundColor: colors.blue,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = colors["blue.3"])
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = colors.blue)
                }
              >
                Pay Now
              </Button> */}
            </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onModalClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            One Time Payment
          </Typography>

          <IconButton
            aria-label="close"
            onClick={onModalClose}
            sx={{
              position: "absolute",
              right: 13,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <X size={24} color={colors.blue} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            p: 4,
            bgcolor: "background.paper",
            maxWidth: 600,
            mx: "auto",
            my: "7%",
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
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
                <StepLabel StepIconComponent={CustomStepIcon}>
                  {label}
                </StepLabel>
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
      </DialogContent>
    </Dialog>
  );
}
