import React, { useEffect, useState } from "react";
import {
  getConvenienceFee,
  getPaymentDetails,
  getPaymentProcessorDetails,
  paymentWithoutSavingDetails,
  saveAcknowledgeForRecurringPayment,
  saveDefaultPaymentMethod,
  schedulePayment,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { calculatePaymentAmount, colors, decryptFunction } from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { paths } from "@/utils/paths";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CreditCard, Leaf } from "@phosphor-icons/react/dist/ssr";
import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
// Correct hook for App Router

// const PaymentMethods = React.lazy(() => import("../customer/payment-methods"));

import { useLocation, useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { z as zod } from "zod";

import { LocalizationProvider } from "@/components/core/localization-provider";
import { useLoading } from "@/components/core/skeletion-context";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";

import { PaymentMethods } from "../customer/payment-methods";
import PaymentSummaryModal from "../overview/payment-summary-modal";
import PaymentIframe from "@/components/CommonComponents/PaymentIframeModal";

// Register plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const schema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.string().email("Invalid email"),
  amount: zod.string().min(1, "Amount is required"),
  convenienceFee: zod.number().optional(),
  duedate: zod.date().refine((val) => !!val, { message: "Required" }),
});

type FormData = zod.infer<typeof schema>;

const PaymentForm = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    // reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      amount: "",
      convenienceFee: 0,
      duedate: dayjs().add(1, "day").toDate(),
    },
  });

  const [paymentType, setPaymentType] = useState<"saved" | "no-save">("saved");
  const [debitType, setDebitType] = useState<"card" | "bank_account">("card");
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const { setContextLoading } = useLoading();
  const location = useLocation();
  const {
    isSchedule,
    dueDate,
    customer_acknowledgement_text = "",
  } = location.state || {};
  const [recurringPaymentEnabled, setRecurringPaymentEnabled] = useState(false);
  const [frequency, setFrequency] = useState("1");
  const [repeatOption, setRepeatOption] = useState("repeat_indefinitely");
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [recurringAckownledgeModal, setRecurringAckownledgeModal] =
    useState(false);
  const onCustomerAckowledge = () => {
    const formdata = new FormData();
    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("customer_id", stored?.body?.customer_id);
    formdata.append("recurring_acknowledge", "1");

    dispatch(
      saveAcknowledgeForRecurringPayment(stored?.body?.token, formdata, () => {
        setRecurringPaymentEnabled(true);
        setRecurringAckownledgeModal(false);
      })
    );
  };
  const onSubmit = (data: FormData) => {
    // console.log({ ...data, paymentType });
  };
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const accountLoading = useSelector(
    (state: RootState) => state?.Account.accountLoading
  );
  const convenienceFee = useSelector(
    (state: RootState) => state?.Account.convenienceFee
  );
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const navigate = useNavigate();

  const paymentMethodInfoCards = useSelector(
    (state: RootState) => state?.Account?.selectedCardInfo
  );

  // const [maxPaymentModal, setMaxPaymentModal] = useState<any>(false);
  const [myCustomerDetails, setCustomerDetails] = useState<any>({
    allow_overpayments: 0,
    balance: 0,
  });

  const paymentDetails = () => {
    const formdata = new FormData();
    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("customer_id", stored?.body?.customer_id);

    dispatch(
      getPaymentDetails(
        stored?.body?.token,
        formdata,
        undefined,
        setCustomerDetails,
        setContextLoading
      )
    );
  };
  React.useEffect(() => {
    paymentDetails();
  }, [stored]);

  const CustomerInfo: any = dashBoardInfo?.body?.customer
    ? dashBoardInfo?.body?.customer
    : getLocalStorage("intuity-customerInfo");

  useEffect(() => {
    if (CustomerInfo?.acctnum) {
      setValue("name", CustomerInfo?.customer_name);
      setValue("email", CustomerInfo?.email);
      setValue("amount", "0.00");
    }
    if (CustomerInfo?.company_id) {
      const formdata = new FormData();
      formdata.append("acl_role_id", stored?.body?.acl_role_id);
      formdata.append("company_id", CustomerInfo?.company_id);
      dispatch(
        getPaymentProcessorDetails(stored?.body?.token, formdata, false)
      );
      const convenienceFeeFormdata = new FormData();
      convenienceFeeFormdata.append("acl_role_id", stored?.body?.acl_role_id);
      convenienceFeeFormdata.append("customer_id", stored?.body?.customer_id);

      dispatch(getConvenienceFee(stored?.body?.token, convenienceFeeFormdata));
    }
  }, [CustomerInfo]);

  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const id = searchParams.get("id");

  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);

  // useEffect(() => {

  //   if (paymentType === "no-save") {
  //     // Skip loading script if saved payment method is selected
  //     const script = document.createElement("script");
  //     script.src = "https://cdn.icheckgateway.com/Scripts/iefixes.min.js";
  //     script.async = true;
  //     document.body.appendChild(script);

  //     return () => {
  //       // Clean up when component unmounts
  //       document.body.removeChild(script);
  //     };
  //   }
  // }, [paymentType]);
  const [cardBankDetails, setCardBankDetails] = useState(null);
  const handleSaveDetails = (data, debitType) => {
    if (data?.error) {
      toast.error(
        data?.error ? data?.error : "Try again something went wrong!"
      );

      return;
    }

    const formdata = new FormData();
    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("customer_id", stored?.body?.customer_id);
    formdata.append("is_one_time", "1");
    formdata.append("id", id);

    formdata.append("pay_payment_method", "pay_unsave_method");
    formdata.append("payment_method_id_radio", debitType);
    formdata.append("is_card", debitType === "card" ? "1" : "0");

    //for card
    if (debitType === "card") {
      formdata.append("credit_card_number", data?.cardNumber);
      formdata.append("card_type", data?.cardType);
      formdata.append("expiration", data?.cardExpDate);
      formdata.append("is_card_one_time", "1");
    }
    if (debitType == "bank_account") {
      formdata.append("bank_account_number", data?.accountNumber);
      formdata.append("routing_number", data?.routingNumber);
      // formdata.append('account_type', data?.accountType);
      formdata.append(
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
    formdata.append("token", data?.token);

    // formdata.append(
    //   "convenienceFee",
    //   String(
    //     watch("convenienceFee") == 0 ? "0.00" : watch("convenienceFee") || 0.0
    //   )
    // );

    formdata.append("payment_method", "0");
    // formdata.append("price", String(watch("amount") || 0));
    formdata.append("price", Number(watch("amount") || 0).toFixed(2));

    formdata.append(
      "convenienceFee",
      Number(watch("convenienceFee") || 0).toFixed(2)
    );

    // "id:26286
    // acl_role_id:4
    // customer_id:810
    // is_one_time:1
    // pay_payment_method:pay_unsave_method
    // payment_method_id_radio:card
    // is_card:1
    // credit_card_number:1111
    // is_card_one_time:1
    // card_type:Visa
    // expiration:1129
    // token:a2697ab75ae347218993e7b0c77f4aa0
    // convenienceFee:0.07
    // payment_method:0
    // price:2.00"

    //     "id:26286
    // acl_role_id:4
    // customer_id:810
    // is_one_time:1
    // pay_payment_method:pay_unsave_method
    // payment_method_id_radio:bank_account
    // is_card:0
    // bank_account_number:0000
    // is_card_one_time:1
    // account_type:Personal Savings
    // token:ec00452005c045ac89051e8de884da19
    // convenienceFee:2.95
    // payment_method:0
    // price:3.00"

    dispatch(
      paymentWithoutSavingDetails(stored?.body?.token, formdata, true, () => {
        navigate(paths.dashboard.payNow());
      })
    );
  };

  const onSaveCardDetails = () => {
    const cardNum = selectedCardDetails.card_token;

    const formdata = new FormData();
    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("customer_id", stored?.body?.customer_id);
    formdata.append("default_payment", "1");
    formdata.append("payment_method_id", cardNum);
    dispatch(
      saveDefaultPaymentMethod(stored?.body?.token, formdata, true, () => {
        setOpenPaymentModal(false);
        setOpenConfirm(false);
        paymentDetails();
        console.log("Payment details saved successfully!"); // Handle success
        // navigate(paths.dashboard.payNow());
      })
    );
  };
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedCardDetails, setSelectedCardDetails] = useState<any>({});
  useEffect(() => {
    setSelectedCardDetails(paymentMethodInfoCards);
  }, [paymentMethodInfoCards]);

  const handlePay = () => {
    setShowPaymentSummary(false);
    const formdata = new FormData();

    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("customer_id", stored?.body?.customer_id);
    formdata.append("is_one_time", "0");
    formdata.append("id", id);

    if (isSchedule) {
      formdata.append("is_one_time", "0");

      // formdata.append(
      //   "payment_method_id_radio",
      //   selectedCardDetails?.card_number ? "card" : "bank_account"
      // );
      // formdata.append("is_card", selectedCardDetails?.card_number ? "1" : "0");
      formdata.append("payment_method_id_radio", "card");
      formdata.append("is_card", "0");

      formdata.append("is_card_one_time", "0");
      formdata.append("convenienceFee", String(watch("convenienceFee") || 0));
      formdata.append("payment_method", "1");
      formdata.append("price", String(watch("amount") || 0));
      formdata.append(
        "payment_method_id_form",
        selectedCardDetails?.card_token
      );
      formdata.append(
        "schedule_date",
        dayjs(watch("duedate")).format("MM/DD/YY")
      );
      formdata.append("pay_now_hidden", "1");

      // is_one_time:0
      // payment_method_id_radio:card
      // is_card:0
      // is_card_one_time:0
      // convenienceFee:0.04
      // payment_method:1
      // price:1.00
      // payment_method_id_form:ca56b25436154679aa30c9e9a911c1c1
      // schedule_date:08/14/2025
      // pay_now_hidden:1"

      //recurring

      if (recurringPaymentEnabled) {
        formdata.append("make_recurring_pay", "1");
        formdata.append("recurring_pay_opt", frequency);
        formdata.append("select_repeat_options", repeatOption);
        formdata.append("repeat_an_additional_times", String(repeatTimes));
      }

      // make_recurring_pay:1
      // recurring_pay_opt:1
      // select_repeat_options:repeat_an_additional
      // repeat_an_additional_times:2"

      dispatch(
        schedulePayment(stored?.body?.token, formdata, () => {
          navigate(paths.dashboard.payNow());
        })
      );
    } else {
      formdata.append("pay_payment_method", "pay_save_method");
      formdata.append("payment_method_id_radio", "card");
      formdata.append("is_card", "0");
      formdata.append("is_card_one_time", "0");
      if (selectedCardDetails?.bank_account_number) {
        formdata.append("is_bank_account_payment_method_form", "1");
      }
      //for bank
      // is_bank_account_payment_method_form:1"

      formdata.append(
        "payment_method_id_form",
        selectedCardDetails?.card_token
      );

      formdata.append("convenienceFee", String(watch("convenienceFee") || 0));
      formdata.append("payment_method", "0");
      formdata.append("price", String(watch("amount") || 0));

      dispatch(
        paymentWithoutSavingDetails(stored?.body?.token, formdata, true, () => {
          navigate(paths.dashboard.payNow());
        })
      );
    }
  };

  const amount = watch("amount");

  useEffect(() => {
    const fee = calculatePaymentAmount({
      amount: watch("amount") || "0",
      paymentType:
        paymentType === "saved"
          ? selectedCardDetails?.card_type
            ? "card"
            : "bank_account"
          : debitType,
      cardType: selectedCardDetails?.card_type || "visa",
      config: convenienceFee,
    }).convenienceFee.toFixed(2);
    setValue("convenienceFee", Number(fee));
  }, [
    amount,
    convenienceFee,
    debitType,
    selectedCardDetails?.card_type,
    paymentType,
    setValue,
    watch,
  ]);
  useEffect(() => {
    if (
      myCustomerDetails?.allow_overpayments == 0 &&
      Number(amount) > Number(myCustomerDetails?.balance || 0) &&
      myCustomerDetails?.id
    ) {
      setValue("amount", myCustomerDetails?.balance || "0");
      toast.warn("Please don't pay more than you owe!");
    }
  }, [amount, myCustomerDetails, setValue]);
  return (
    <SkeletonWrapper>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Name/Email For Payment Receipt
            </Typography>

            <Box
              display="flex"
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 1, sm: 2 },
              }}
            >
              {/* Payment Methods */}
              <Typography
                sx={{
                  fontSize: 14,
                  color: colors.blue,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  ":hover": { cursor: "pointer" },
                }}
                onClick={() => setOpenPaymentModal(true)}
              >
                <CreditCard
                  color={"var(--NavItem-icon-color)"}
                  size={20}
                  weight={"regular"}
                  style={{
                    fontSize: "var(--icon-fontSize-md)",
                    background: "transparent",
                    fill: "currentColor",
                  }}
                />
                PAYMENT METHODS
              </Typography>

              {/* Go Paperless */}
              {myCustomerDetails.paperless === 0 && (
                <Typography
                  sx={{
                    fontSize: 14,
                    color: colors.blue,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    ":hover": { cursor: "pointer" },
                  }}
                  onClick={() => navigate(paths.dashboard.paperless())}
                >
                  <Leaf
                    color={"var(--NavItem-icon-color)"}
                    size={20}
                    weight={"regular"}
                    style={{
                      fontSize: "var(--icon-fontSize-md)",
                      background: "transparent",
                      fill: "currentColor",
                    }}
                  />
                  GO PAPERLESS
                </Typography>
              )}
            </Box>
          </Box>

          {/* Name & Email */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box flex={1}>
              <Typography fontWeight={600}>Name</Typography>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Box>

            <Box flex={1}>
              <Typography fontWeight={600}>Email</Typography>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Amount */}
          <Box sx={{ mb: 4 }}>
            <Typography fontWeight={600}>Amount to pay</Typography>
            <Controller
              name="amount"
              control={control}
              rules={{
                required: "Amount is required",
                min: { value: 1, message: "Amount must be greater than 0" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  type="number"
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                  InputProps={{
                    startAdornment: <span style={{ marginRight: 4 }}>$</span>,
                  }}
                  onChange={(e) => {
                    let value = e.target.value;

                    // Prevent empty or 0
                    if (value === "" || Number(value) <= 0) {
                      toast.warn("Amount should be more than 0");
                      return;
                    }

                    field.onChange(value);
                  }}
                  // onBlur={(e) => {
                  //   // Also enforce on blur (in case user clears and leaves field)
                  //   if (!e.target.value || Number(e.target.value) <= 0) {
                  //     field.onChange("1");
                  //   }
                  // }}
                />
              )}
            />
            <Stack
              direction={{ xs: "column", sm: "row" }} // column on extra small, row from small+
              spacing={2}
              sx={{ mt: 1 }}
            >
              <Typography sx={{ fontSize: 14, color: colors.blue }}>
                Additional Convenience Fee: ${watch("convenienceFee") || 0}
              </Typography>
              <Typography sx={{ fontSize: 14, color: colors.blue }}>
                Total Payment: $
                {(
                  (Number(watch("amount")) || 0) +
                  (watch("convenienceFee") || 0)
                ).toFixed(2)}
              </Typography>
            </Stack>
          </Box>

          {/* Payment Method Option */}
          {isSchedule ? (
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                {/* Left side: Date */}
                <Grid item xs={12} md={6}>
                  <LocalizationProvider>
                    <Controller
                      name="duedate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Date to Pay"
                          value={dayjs(field.value)}
                          minDate={dayjs()}
                          disablePast
                          onChange={(date: Dayjs | null) =>
                            field.onChange(date?.toDate())
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                              error: !!errors.duedate,
                              helperText: errors.duedate?.message,
                              inputProps: { readOnly: true },
                              color: "primary",
                            },
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                {/* Right side: Texts */}
                <Grid item xs={12} md={6}>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography fontWeight={600}>Due Date</Typography>
                    <Typography fontWeight={600}>{dueDate}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <RadioGroup
                value={paymentType}
                onChange={(e) => {
                  if (e.target.value == "no-save") {
                    if (Number(watch("amount")) === 0) {
                      toast.warn("Amount should be more than 0");
                      return;
                    }
                  }
                  setPaymentType(e.target.value as "saved" | "no-save");
                }}
              >
                <FormControlLabel
                  value="saved"
                  control={<Radio />}
                  label="Pay with a saved payment method"
                />
                <FormControlLabel
                  value="no-save"
                  control={<Radio />}
                  label="Pay without saving a payment method"
                />
              </RadioGroup>
            </Box>
          )}

          {isSchedule && (
            <Box display="flex" flexDirection="column" gap={2} mb={2}>
              {/* Checkbox */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={recurringPaymentEnabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRecurringAckownledgeModal(true);
                      } else {
                        setRecurringPaymentEnabled(e.target.checked);
                      }
                    }}
                    color="primary"
                  />
                }
                label="Make a recurring payment of the same amount, on the same day"
              />

              {recurringPaymentEnabled && (
                <>
                  {/* Frequency Select */}
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      label="Frequency"
                    >
                      <MenuItem value="1">Every month</MenuItem>
                      <MenuItem value="2">Every 2 months</MenuItem>
                      <MenuItem value="3">Every 3 months</MenuItem>
                      <MenuItem value="6">Every 6 months</MenuItem>
                      <MenuItem value="12">Every year</MenuItem>
                    </Select>
                    <FormHelperText>
                      Recurring payments will not pay your invoice amount on the
                      due date.
                    </FormHelperText>
                  </FormControl>

                  {/* Repeat options */}
                  <FormControl>
                    <RadioGroup
                      value={repeatOption}
                      onChange={(e) => setRepeatOption(e.target.value)}
                    >
                      {/* First Option */}
                      <FormControlLabel
                        value="repeat_indefinitely"
                        control={<Radio />}
                        label="Repeat indefinitely"
                        sx={{
                          width: "220px",
                        }}
                      />

                      {/* Second Option (Radio + Select + Text Inline) */}
                      <FormControlLabel
                        value="repeat_an_additional"
                        control={<Radio />}
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography>Repeat an additional</Typography>
                            <Select
                              size="small"
                              value={repeatTimes}
                              onChange={(e) =>
                                setRepeatTimes(Number(e.target.value))
                              }
                              sx={{ width: 80 }}
                              disabled={repeatOption !== "repeat_an_additional"}
                            >
                              {Array.from(Array(25).keys()).map((n) => (
                                <MenuItem key={n + 1} value={n + 1}>
                                  {n + 1}
                                </MenuItem>
                              ))}
                            </Select>
                            <Typography>
                              times after the first payment
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </>
              )}
            </Box>
          )}

          {/* Saved Card Info Block (only show if saved method selected) */}
          {paymentType === "saved" ? (
            selectedCardDetails?.id ? (
              <>
                <Box
                  component={Paper}
                  variant="outlined"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    mb: 3,
                    backgroundColor: "#f3f9fd",
                  }}
                >
                  <FormControlLabel
                    value="visa"
                    control={<Radio checked />}
                    label={
                      selectedCardDetails?.card_type ??
                      selectedCardDetails?.account_type
                    }
                  />
                  <Typography
                    sx={{
                      fontFamily: "monospace", // ensures * and numbers align perfectly
                    }}
                  >
                    {selectedCardDetails?.card_number
                      ? decryptFunction(selectedCardDetails?.card_number)
                      : selectedCardDetails?.bank_account_number
                      ? decryptFunction(
                          selectedCardDetails?.bank_account_number
                        )
                      : ""}
                  </Typography>
                  <Typography>
                    {selectedCardDetails?.card_number ? "Card" : "Bank Account"}
                  </Typography>
                  <Typography>
                    {/* {selectedCardDetails?.date_used} */}

                    {dayjs
                      .tz(selectedCardDetails?.date_used, "America/Chicago") // or whichever US timezone server uses
                      .tz(dayjs.tz.guess()) // convert to user's local time
                      .format("YYYY-MM-DD hh:mm A z")}
                  </Typography>
                </Box>
                {/* Confirm Button */}
                <Button
                  onClick={() => {
                    if (Number(watch("amount")) === 0) {
                      toast.warn("Amount should be more than 0");
                      return;
                    }
                    setShowPaymentSummary(true);
                  }}
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 1,
                    px: 4,
                    fontWeight: "bold",

                    backgroundColor: colors.blue,
                    "&:hover": {
                      backgroundColor: colors["blue.3"], // or any other hover color
                    },
                  }}
                >
                  {isSchedule ? "Schedule a Payment" : " CONFIRM PAYMENT"}
                </Button>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No saved payment methods available. Please add a payment method.
              </Typography>
            )
          ) : (
            <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <RadioGroup
                row
                value={debitType}
                onChange={(e) =>
                  setDebitType(e.target.value as "card" | "bank_account")
                }
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
            </Box>
          )}
        </form>

        {paymentType === "no-save" && (
          <PaymentIframe
            type={debitType == "card" ? "card" : "account"}
            // onSuccess={(data: any) => handleSaveDetails(data, debitType)}
            onSuccess={(data: any) => setCardBankDetails(data)}
          />
        )}

        {openPaymentModal && (
          <Dialog open={openPaymentModal} maxWidth="lg" fullWidth>
            <PaymentMethods
              onClose={() => {
                setOpenPaymentModal(false);
              }}
              isModal={true}
              count={10}
              page={1}
              rows={[]}
              rowsPerPage={10}
              onSaveCardDetails={(data) => {
                setSelectedCardDetails(data);
                setOpenConfirm(true);
              }}
              paymentDetailsPage={true}
            />
          </Dialog>
        )}
        {(showPaymentSummary || cardBankDetails) && (
          <PaymentSummaryModal
            open={showPaymentSummary || cardBankDetails}
            onClose={() => {
              if (cardBankDetails) {
                setCardBankDetails(null);
              }
              if (showPaymentSummary) setShowPaymentSummary(false);
            }}
            onPay={() => {
              if (cardBankDetails) {
                setCardBankDetails(null);
                handleSaveDetails(cardBankDetails, debitType);
              } else {
                handlePay();
              }
            }}
            amount={Number(amount || 0)}
            fee={Number(watch("convenienceFee") || 0)}
            cardType={
              cardBankDetails
                ? cardBankDetails?.cardType ?? "Bank Account"
                : selectedCardDetails?.card_type || "Bank Account"
            }
            cardLast4={
              cardBankDetails
                ? cardBankDetails?.cardNumber ?? cardBankDetails?.accountNumber
                : selectedCardDetails?.card_number ??
                  selectedCardDetails?.bank_account_number
            }
            dueDate={isSchedule ? watch("duedate") : null}
            Recurring={recurringPaymentEnabled ? frequency : null}
            Payment={
              recurringPaymentEnabled
                ? repeatOption == "repeat_indefinitely"
                  ? "Thereafter"
                  : String(repeatTimes)
                : null
            }
          />
        )}
        {openConfirm && (
          <ConfirmDialog
            open={openConfirm}
            title={"Default payment method?"}
            message={`Do you want to save this as your default payment method?
`}
            confirmLabel="Yes, Confirm"
            cancelLabel="No"
            onConfirm={onSaveCardDetails}
            onCancel={() => {
              setOpenConfirm(false);
              setOpenPaymentModal(false);
            }}
            loader={accountLoading}
          />
        )}
        {recurringAckownledgeModal && (
          <ConfirmDialog
            open={recurringAckownledgeModal}
            title={"Customer Acknowledgement"}
            message={customer_acknowledgement_text}
            confirmLabel="Yes, Confirm"
            cancelLabel="No"
            onConfirm={onCustomerAckowledge}
            onCancel={() => {
              setRecurringAckownledgeModal(false);
            }}
            loader={accountLoading}
            checkBox={true}
          />
        )}
        <CustomBackdrop
          open={accountLoading}
          style={{ zIndex: 1300, color: "#fff" }}
        >
          <Loader />
        </CustomBackdrop>
      </Box>
    </SkeletonWrapper>
  );
};

export default PaymentForm;
