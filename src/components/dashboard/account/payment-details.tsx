import React, { useEffect, useState } from "react";

import {
  getConvenienceFee,
  getPaymentDetails,
  getPaymentProcessorDetails,
  paymentWithoutSavingDetails,
  saveDefaultPaymentMethod,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { Leaf, CreditCard } from "@phosphor-icons/react/dist/ssr";

import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { z as zod } from "zod";

// Correct hook for App Router

// const PaymentMethods = React.lazy(() => import("../customer/payment-methods"));

import { useNavigate, useSearchParams } from "react-router";
import { paths } from "@/utils/paths";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import PaymentSummaryModal from "../overview/payment-summary-modal";
import { PaymentMethods } from "../customer/payment-methods";
import { SkeletonWrapper } from "@/components/core/withSkeleton";
import { useLoading } from "@/components/core/skeletion-context";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";

// Register plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const schema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.string().email("Invalid email"),
  amount: zod.string().min(1, "Amount is required"),
  convenienceFee: zod.number().optional(),
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
    },
  });

  const [paymentType, setPaymentType] = useState<"saved" | "no-save">("saved");
  const [debitType, setDebitType] = useState<"card" | "bank_account">("card");
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const { setContextLoading } = useLoading();

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

  const paymentProcessorDetails = useSelector(
    (state: RootState) => state?.Account?.paymentProcessorDetails
  );
  const paymentMethodInfoCards = useSelector(
    (state: RootState) => state?.Account?.selectedCardInfo
  );

  const [processorDetails, setProcessorDetails] = useState<any>({});
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
  useEffect(() => {
    if (paymentProcessorDetails?.current_processor?.length > 0) {
      const details =
        paymentProcessorDetails[
          paymentProcessorDetails?.current_processor[0]?.config_value
        ]?.[0]?.config_value;
      setProcessorDetails(JSON.parse(details));
    }
  }, [paymentProcessorDetails]);
  const CustomerInfo: any = dashBoardInfo?.body?.customer
    ? dashBoardInfo?.body?.customer
    : getLocalStorage("intuity-customerInfo");
  const [isPaperLessOn, setIsPaperLessOn] = useState(false);

  useEffect(() => {
    setIsPaperLessOn(CustomerInfo?.paperless === 1 ? true : false);
  }, [CustomerInfo?.paperless]);

  const iframeUrlForBank = `https://iframe.icheckdev.com/iFrameBA.aspx?appId=${
    processorDetails?.app_id
  }&appSecret=${processorDetails?.app_secret}&custId=${
    CustomerInfo?.acctnum
  }&firstName=${watch("name") ?? CustomerInfo?.customer_name}&email=${watch(
    "email"
  )}&amp;street1=${CustomerInfo?.customer_nameaddress}+&amount=${
    Number(watch("amount")) || 0
  }&entryClassCode=WEB&saveTokenDisabled=false`;
  //For New Card adding
  const iframeUrlForCard = `https://iframe.icheckdev.com/iFrameCC.aspx?appId=${
    processorDetails?.app_id
  }&appSecret=${processorDetails?.app_secret}&custId=${
    CustomerInfo?.acctnum
  }&firstName=${watch("name") ?? CustomerInfo?.customer_name}&email=${watch(
    "email"
  )}&amp;street1=${CustomerInfo?.customer_nameaddress}+&amount=${
    Number(watch("amount")) || 0
  }&entryClassCode=WEB&saveTokenDisabled=false`;

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };

  // const linkedUsersInfoStored = getLocalStorage('linked-customerInfo');
  // let linkedUsersInfo = dashBoardInfo?.body?.linked_customers || linkedUsersInfoStored || [];

  // useEffect(() => {
  //   if (linkedUsersInfo?.length > 0 && stored?.body?.customer_id) {
  //     let currentUserInfo = linkedUsersInfo?.filter((account) => {
  //       if (stored?.body?.customer_id == account?.link_customer_id) {
  //         return account;
  //       }
  //     });
  //     console.log(currentUserInfo, 'currentUserInfo');
  //   }
  // }, [linkedUsersInfo]);

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

  useEffect(() => {
    // Dynamically load the external iCG script

    if (paymentType === "no-save") {
      // Skip loading script if saved payment method is selected
      const script = document.createElement("script");
      script.src = "https://cdn.icheckgateway.com/Scripts/iefixes.min.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        // Clean up when component unmounts
        document.body.removeChild(script);
      };
    }
  }, [paymentType]);
  // useEffect(() => {
  //   if (linkedAccountsInfo?.id) {
  //     const formdata = new FormData();
  //     formdata.append('acl_role_id', stored?.body?.acl_role_id);
  //     formdata.append('company_id', linkedAccountsInfo?.id);

  //     dispatch(getPaymentProcessorDetails(stored?.body?.token, formdata, false));
  //   }
  // }, [linkedAccountsInfo]);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data?.custId) {
        console.log(event?.data);
        handleSaveDetails(event.data, debitType);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [debitType]);

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

    formdata.append("convenienceFee", "0.07");
    formdata.append("payment_method", "0");
    formdata.append("price", "2.00");

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
        // console.log('Payment details saved successfully!'); // Handle success
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

    formdata.append("pay_payment_method", "pay_save_method");
    formdata.append("payment_method_id_radio", "card");
    formdata.append("is_card", "0");
    formdata.append("is_card_one_time", "0");
    if (selectedCardDetails?.bank_account_number) {
      formdata.append("is_bank_account_payment_method_form", "1");
    }
    //for bank
    // is_bank_account_payment_method_form:1"

    formdata.append("payment_method_id_form", selectedCardDetails?.card_token);

    formdata.append("convenienceFee", String(watch("convenienceFee") || 0));
    formdata.append("payment_method", "0");
    formdata.append("price", String(watch("amount") || 0));

    dispatch(
      paymentWithoutSavingDetails(stored?.body?.token, formdata, true, () => {
        // console.log('Payment details saved successfully!'); // Handle success
        navigate(paths.dashboard.payNow());
      })
    );
  };

  type PaymentConfig = {
    config_data_card?: Record<string, any>;
    config_data_ach?: Record<string, any>;
    [key: string]: any;
  };

  function calculatePaymentAmount({
    amount,
    paymentType,
    cardType = "other",
    config = {},
  }: {
    amount: number | string;
    paymentType: string;
    cardType?: string;
    config?: PaymentConfig;
  }) {
    const parseNum = (v: any) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : 0;
    };

    const base = parseNum(amount);
    // PHP only calculates when amount > 0 in the keyup path — follow that
    if (base <= 0)
      return {
        baseAmount: base,
        convenienceFee: 0.0,
        total: Number(base.toFixed(2)),
      };

    let conv = 0;
    const cardConfig = (config && config.config_data_card) || {};
    const achConfig = (config && config.config_data_ach) || {};

    // Helper to compute same branching logic as PHP for a group of (fixed, percentage, minimum)
    function computeFeeFromFields(baseAmount, fixedField, percField, minField) {
      const fixed = parseNum(fixedField);
      const perc = parseNum(percField);
      const minimum = parseNum(minField);

      if (fixed > 0 && perc > 0) {
        conv = (baseAmount * perc) / 100 + fixed;
        conv = Number(conv.toFixed(2)); // PHP does rounding here
        return conv > minimum ? conv : minimum;
      } else if (perc > 0) {
        conv = Number(((baseAmount * perc) / 100).toFixed(2));
        return conv > minimum ? conv : minimum;
      } else if (fixed > 0) {
        conv = Number(fixed.toFixed(2));
        return conv > minimum ? conv : minimum;
      } else {
        // fallback to minimum (even if zero)
        return minimum;
      }
    }

    if (paymentType === "card") {
      if (cardType === "amex") {
        conv = computeFeeFromFields(
          base,
          cardConfig.credit_card_amex_amount_convenience_fee,
          cardConfig.credit_card_amex_percentage_convenience_fee,
          cardConfig.credit_card_amex_minimum_amount_convenience_fee
        );
      } else {
        conv = computeFeeFromFields(
          base,
          cardConfig.credit_card_amount_convenience_fee,
          cardConfig.credit_card_percentage_convenience_fee,
          cardConfig.credit_card_minimum_amount_convenience_fee
        );
      }
    } else if (paymentType === "bank_account") {
      conv = computeFeeFromFields(
        base,
        achConfig.bank_amount_convenience_fee_ach,
        achConfig.bank_percentage_convenience_fee_ach,
        achConfig.bank_minimum_amount_convenience_fee_ach
      );
    }

    const convenienceFee = Number(conv.toFixed(2));
    const total = Number((base + convenienceFee).toFixed(2));

    return {
      baseAmount: Number(base.toFixed(2)),
      convenienceFee,
      total,
    };
  }
  // const resultCard = calculatePaymentAmount({
  //   amount: 10,
  //   paymentType: "card",
  //   cardType: "visa", // or 'amex'
  //   config: convenienceFee,
  // });

  // const resultACH = calculatePaymentAmount({
  //   amount: 200,
  //   paymentType: "bank_account",
  //   config: convenienceFee,
  // });

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
          {/* Section Title + Link */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            sx={{
              flexDirection: { xs: "column", sm: "row" }, // column for small, row for larger
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 1, sm: 0 }, // spacing in column mode
            }}
          >
            {/* Left Side */}
            <Typography variant="h6" color="text.secondary">
              Name/Email For Payment Receipt
            </Typography>

            {/* Right Side */}
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
              {!isPaperLessOn && (
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
          <Box sx={{ mb: 2 }}>
            <Typography fontWeight={600}>Amount to pay</Typography>
            <Controller
              name="amount"
              control={control}
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
                />
              )}
            />
            <Typography sx={{ mt: 1, fontSize: 14, color: colors.blue }}>
              Additional convenience Fee:$ {watch("convenienceFee") || 0}
            </Typography>
            <Typography sx={{ fontSize: 14, color: colors.blue }}>
              Total Payment: ${" "}
              {(
                (Number(watch("amount")) || 0) + (watch("convenienceFee") || 0)
              ).toFixed(2)}
            </Typography>
          </Box>

          {/* Payment Method Option */}
          <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <RadioGroup
              value={paymentType}
              onChange={(e) =>
                setPaymentType(e.target.value as "saved" | "no-save")
              }
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
                  <Typography>
                    {selectedCardDetails?.card_number ??
                      selectedCardDetails?.bank_account_number}
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
                  CONFIRM PAYMENT
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
        {paymentType === "no-save" && iframeLoading && (
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
        {paymentType === "no-save" && (
          <div className="projects-section-line" style={{ marginTop: "20px" }}>
            <iframe
              id="iFrameBA"
              name="iFrameBA"
              src={debitType == "card" ? iframeUrlForCard : iframeUrlForBank}
              scrolling="no"
              width="500"
              height="500"
              frameBorder="0"
              title="ICG Payment"
              onLoad={() => setIframeLoading(false)}
            ></iframe>
          </div>
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
        {showPaymentSummary && (
          <PaymentSummaryModal
            open={showPaymentSummary}
            onClose={() => setShowPaymentSummary(false)}
            onPay={handlePay}
            amount={Number(amount || 0)}
            fee={Number(watch("convenienceFee") || 0)}
            cardType={selectedCardDetails?.card_type || "Bank Account"}
            cardLast4={
              selectedCardDetails?.card_number ??
              selectedCardDetails?.bank_account_number
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
