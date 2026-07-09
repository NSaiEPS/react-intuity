import React, { useEffect, useState } from 'react';
import { BASE_URL } from '@/api/axios';
import {
  getConvenienceFee,
  getPaymentDetails,
  getPaymentProcessorDetails,
  paymentWithoutSavingDetails,
  saveAcknowledgeForRecurringPayment,
  saveDefaultPaymentMethod,
  schedulePayment,
} from '@/state/features/accountSlice';
import { RootState } from '@/state/store';
import { calculatePaymentAmount, colors, CustomerInfo, decryptFunction, maskValue } from '@/utils';
import { getLocalStorage, IntuityUser } from '@/utils/auth';
import { paths } from '@/utils/paths';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// Correct hook for App Router
import { CurrencyDollar, Question } from '@phosphor-icons/react';
import { CreditCard, Leaf } from '@phosphor-icons/react/dist/ssr';
import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import DOMPurify from 'dompurify';
import { CustomBackdrop, Loader } from 'nsaicomponents';
import { Controller, useForm } from 'react-hook-form';
// const PaymentMethods = React.lazy(() => import("../customer/payment-methods"));

import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { z as zod } from 'zod';

import { toast } from '@/lib/custom-toast';
import { useDispatch, useSelector } from '@/hooks/redux';
import PaymentIframe from '@/components/CommonComponents/PaymentIframeModal';
import { LocalizationProvider } from '@/components/core/localization-provider';
// import { useLoading } from '@/components/core/skeletion-context';
import { SkeletonWrapper } from '@/components/core/withSkeleton';
import { ConfirmDialog } from '@/styles/theme/components/ConfirmDialog';

import { PaymentMethods } from '../customer/payment-methods';
import PaymentSummaryModal from '../overview/payment-summary-modal';
import { useLoading } from '@/components/core/skeleton-context';

// Register plugins
dayjs.extend(utc);
dayjs.extend(timezone);
const schema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  email: zod.string().email('Invalid email'),
  amount: zod.string().min(1, 'Amount is required'),
  convenienceFee: zod.number().optional(),
  duedate: zod.date().refine((val) => !!val, { message: 'Required' }),
});

type FormData = zod.infer<typeof schema>;

export const renderCardBrand = (brand?: string) => {
  const b = (brand || 'visa').toLowerCase();
  if (b.includes('visa')) {
    return (
      <Box
        sx={{
          border: '1px solid #E0E0E0',
          borderRadius: '4px',
          px: 1.2,
          py: 0.4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          height: '24px',
        }}
      >
        <span
          style={{ fontWeight: '900', color: '#1A1F71', fontStyle: 'italic', fontSize: '13px', letterSpacing: '0.5px' }}
        >
          VISA
        </span>
      </Box>
    );
  }
  if (b.includes('mastercard') || b.includes('master')) {
    return (
      <Box
        sx={{
          border: '1px solid #E0E0E0',
          borderRadius: '4px',
          px: 1.2,
          py: 0.4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          height: '24px',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#EB001B', fontSize: '11px' }}>MC</span>
      </Box>
    );
  }
  if (b.includes('discover')) {
    return (
      <Box
        sx={{
          border: '1px solid #E0E0E0',
          borderRadius: '4px',
          px: 1.2,
          py: 0.4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          height: '24px',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#F27020', fontSize: '11px' }}>Discover</span>
      </Box>
    );
  }
  if (b.includes('amex') || b.includes('american express')) {
    return (
      <Box
        sx={{
          border: '1px solid #E0E0E0',
          borderRadius: '4px',
          px: 1.2,
          py: 0.4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          height: '24px',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#0070CD', fontSize: '11px' }}>Amex</span>
      </Box>
    );
  }
  if (b.includes('checking') || b.includes('savings') || b.includes('bank') || b.includes('account')) {
    return (
      <Box
        sx={{
          border: '1px solid #E0E0E0',
          borderRadius: '4px',
          px: 1.2,
          py: 0.4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          height: '24px',
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#2C3E50', fontSize: '11px' }}>BANK</span>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        border: '1px solid #E0E0E0',
        borderRadius: '4px',
        px: 1,
        py: 0.4,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        height: '24px',
      }}
    >
      <CreditCard size={18} color="#555" />
    </Box>
  );
};

export interface CardDetails {
  date_used?: string | number | Date | Dayjs;

  account_type?: string;
  card_number?: string;
  bank_account_number?: string;
  card_type?: string;
  card_token: number | string;


  id?: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
    expiration_month?: string | number;
  expiration_year?: string | number;

  [key: string]: unknown;
    name: string;
  number: string;
  type: string;
  createdAt: string;
  isBank: boolean;



}

export const getCardLast4 = (selectedCardDetails: CardDetails) => {
  const num = selectedCardDetails?.card_number
    ? decryptFunction(selectedCardDetails.card_number)
    : selectedCardDetails?.bank_account_number
      ? decryptFunction(selectedCardDetails.bank_account_number)
      : '';
  return num ? num.slice(-4) : '';
};

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
      name: '',
      email: '',
      amount: '',
      convenienceFee: 0,
      duedate: dayjs().add(1, 'day').toDate(),
    },
  });

  const [paymentType, setPaymentType] = useState<'saved' | 'no-save'>('saved');

  const [debitType, setDebitType] = useState<'card' | 'bank_account'>('card');
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const { setContextLoading } = useLoading();
  const location = useLocation();
  const { isSchedule, dueDate, customer_acknowledgement_text = '' } = location.state || {};
  // console.log(dueDate, 'Due Date');
  // //console.log(isSchedule, dueDate, customer_acknowledgement_text);
  const [recurringPaymentEnabled, setRecurringPaymentEnabled] = useState(false);
  const [frequency, setFrequency] = useState('1');
  const [repeatOption, setRepeatOption] = useState('repeat_indefinitely');
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [recurringAckownledgeModal, setRecurringAckownledgeModal] = useState(false);

  const [saveThisPaymentForFuture, setSaveThisPaymentForFuture] = useState(false);

  const onCustomerAckowledge = () => {
    const formdata = new FormData();
    formdata.append('acl_role_id', stored?.body?.acl_role_id);
    formdata.append('customer_id', stored?.body?.customer_id);
    formdata.append('recurring_acknowledge', '1');

    dispatch(
      saveAcknowledgeForRecurringPayment(formdata, () => {
        setRecurringPaymentEnabled(true);
        setRecurringAckownledgeModal(false);
      })
    );
  };
  const onSubmit = (data: FormData) => {
    // //console.log({ ...data, paymentType });
  };
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const accountLoading = useSelector((state: RootState) => state?.Account.accountLoading);
  const convenienceFee = useSelector((state: RootState) => state?.Account.convenienceFee);
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);

  const raw = userInfo?.body ? userInfo : getLocalStorage('intuity-user');

  const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;
  const navigate = useNavigate();
  const myCard = useSelector((state: RootState) => state?.Account?.paymentMethodInfoCards);
  const paymentMethodInfoCards:any = useSelector((state: RootState) => state?.Account?.selectedCardInfo);
  const paymentDetailsInfo = useSelector((state: RootState) => state?.Account?.paymentDetailsInfo);

  useEffect(() => {
    if (paymentDetailsInfo?.customer?.balance) {
      setValue('amount', paymentDetailsInfo?.customer?.balance);
    }
  }, [paymentDetailsInfo]);
  // const [maxPaymentModal, setMaxPaymentModal] = useState<any>(false);

  const [myCustomerDetails, setCustomerDetails] = useState<{
    allow_overpayments: number;
    balance: number;
    id?: number;
    paperless?: 0 | 1;
  }>({
    allow_overpayments: 0,
    balance: 0,
  });

  const paymentDetails = () => {
    const formdata = new FormData();
    formdata.append('acl_role_id', stored?.body?.acl_role_id);
    formdata.append('customer_id', stored?.body?.customer_id);

    dispatch(getPaymentDetails(formdata, undefined, setCustomerDetails, setContextLoading));
  };
  React.useEffect(() => {
    paymentDetails();
  }, [stored]);
  const [hovered, setHovered] = useState(false);

  const CustomerInfo: CustomerInfo | null = dashBoardInfo?.body?.customer
    ? (dashBoardInfo?.body?.customer as unknown as CustomerInfo)
    : (getLocalStorage('intuity-customerInfo') as CustomerInfo | null);

  useEffect(() => {
    if (CustomerInfo?.acctnum) {
      setValue('name', CustomerInfo?.customer_name);
      setValue('email', CustomerInfo?.email);
      setValue('amount', '0.00');
    }
    if (CustomerInfo?.company_id) {
      const formdata = new FormData();
      formdata.append('acl_role_id', stored?.body?.acl_role_id);
      formdata.append('company_id', CustomerInfo?.company_id);
      dispatch(getPaymentProcessorDetails(formdata, false));
      const convenienceFeeFormdata = new FormData();
      convenienceFeeFormdata.append('acl_role_id', stored?.body?.acl_role_id);
      convenienceFeeFormdata.append('customer_id', stored?.body?.customer_id);

      dispatch(getConvenienceFee(convenienceFeeFormdata));
    }
  }, [CustomerInfo]);

  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const transId = searchParams.get('transId');
  // //console.log(transId, id, "transId");

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
      toast.error(data?.error ? data?.error : 'Try again something went wrong!');

      return;
    }

    const formdata = new FormData();
    formdata.append('acl_role_id', stored?.body?.acl_role_id);
    formdata.append('customer_id', stored?.body?.customer_id);
    formdata.append('is_one_time', '1');
    formdata.append('id', id);

    formdata.append('pay_payment_method', 'pay_unsave_method');
    formdata.append('payment_method_id_radio', debitType);
    formdata.append('is_card', debitType === 'card' ? '1' : '0');

    //for card
    if (debitType === 'card') {
      if (data?.ssl_token) {
        // formdata.append("salestax", data?.ssl_token);
        formdata.append('salestax', '0');

        formdata.append('credit_card_number', data?.ssl_card_number);
        formdata.append('card_type', data?.ssl_card_short_description);
        formdata.append('expiration', data?.ssl_exp_date);
        formdata.append('approval_code', data?.ssl_approval_code);
        formdata.append('is_card_one_time', '1');
        formdata.append('paytype_category', data?.ssl_card_short_description);
      } else {
        formdata.append('credit_card_number', data?.cardNumber);
        formdata.append('card_type', data?.cardType);
        formdata.append('expiration', data?.cardExpDate);
        formdata.append('is_card_one_time', '1');
      }
    }
    if (debitType == 'bank_account') {
      if ('expiration' in data) {
        formdata.append('expiration', '');
      }

      formdata.append('bank_account_number', data?.accountNumber);
      formdata.append('routing_number', data?.routingNumber);
      // formdata.append('account_type', data?.accountType);
      formdata.append(
        'account_type',
        data?.accountType === 'PC'
          ? 'Personal Checking'
          : data?.accountType === 'PS'
            ? 'Personal Savings'
            : data?.accountType === 'BC'
              ? 'Business Checking'
              : data?.accountType === 'BS'
                ? 'Business Savings'
                : data?.accountType === 'GL'
                  ? 'General Ledger'
                  : ' Other'
      );
    }
    formdata.append('token', data?.ssl_token ?? data?.token);

    // formdata.append(
    //   "convenienceFee",
    //   String(
    //     watch("convenienceFee") == 0 ? "0.00" : watch("convenienceFee") || 0.0
    //   )
    // );

    formdata.append('payment_method', '0');
    // formdata.append("price", String(watch("amount") || 0));
    formdata.append('price', Number(watch('amount') || 0).toFixed(2));

    formdata.append('convenienceFee', Number(watch('convenienceFee') || 0).toFixed(2));

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
      paymentWithoutSavingDetails(formdata, true, () => {
        navigate(paths.dashboard.payNow());
      })
    );
  };

  const onSaveCardDetails = () => {
    const cardNum:string = selectedCardDetails.card_token;

    const formdata = new FormData();
    formdata.append('acl_role_id', stored?.body?.acl_role_id);
    formdata.append('customer_id', stored?.body?.customer_id);
    formdata.append('default_payment', '1');
    formdata.append('payment_method_id', cardNum);
    dispatch(
      saveDefaultPaymentMethod(formdata, true, () => {
        setOpenPaymentModal(false);
        setOpenConfirm(false);
        paymentDetails();
        //console.log("Payment details saved successfully!"); // Handle success
        // navigate(paths.dashboard.payNow());
      })
    );
  };
  const [openConfirm, setOpenConfirm] = useState(false);


  const [selectedCardDetails, setSelectedCardDetails] = useState<any>({});
  useEffect(() => {
    setSelectedCardDetails(paymentMethodInfoCards);
  }, [paymentMethodInfoCards]);

  const amount = watch('amount');

  useEffect(() => {
    const fee = calculatePaymentAmount({
      amount: watch('amount') || '0',
      paymentType: paymentType === 'saved' ? (selectedCardDetails?.card_type ? 'card' : 'bank_account') : debitType,
      cardType: selectedCardDetails?.card_type || 'visa',
      config: convenienceFee,
    }).convenienceFee.toFixed(2);
    setValue('convenienceFee', Number(fee));
  }, [amount, convenienceFee, debitType, selectedCardDetails?.card_type, paymentType, setValue, watch]);
  useEffect(() => {
    if (
      myCustomerDetails?.allow_overpayments == 0 &&
      Number(amount) > Number(myCustomerDetails?.balance || 0) &&
      myCustomerDetails?.id
    ) {
      setValue('amount', `${myCustomerDetails?.balance ?? 0}`);
      toast.warn("Please don't pay more than you owe!");
    }
  }, [amount, myCustomerDetails, setValue]);
  // useEffect(() => {
  //   if (transId && transId !== "0") {
  //     toast.success("Card Added Successfully");
  //   }
  // }, [transId]);
  const cardConvenienceFee = searchParams.get('convenience_fee');
  const cardAmount = searchParams.get('amount');
  const cardTransId = searchParams.get('transId');
  const card_no = searchParams.get('card_no');
  const card_type = searchParams.get('card_type');
  const expiration = searchParams.get('expiration');
  // //console.log(cardAmount, "cardAmount");
  useEffect(() => {
    if (cardAmount && cardConvenienceFee && cardTransId) {
      setShowPaymentSummary(true);
    }
  }, [searchParams]);

  const handlePay = () => {
    setShowPaymentSummary(false);
    const formdata = new FormData();

    formdata.append('acl_role_id', stored?.body?.acl_role_id);
    formdata.append('customer_id', stored?.body?.customer_id);
    formdata.append('is_one_time', '0');
    formdata.append('id', id);

    if (isSchedule) {
      formdata.append('is_one_time', '0');

      // formdata.append(
      //   "payment_method_id_radio",
      //   selectedCardDetails?.card_number ? "card" : "bank_account"
      // );
      // formdata.append("is_card", selectedCardDetails?.card_number ? "1" : "0");
      formdata.append('payment_method_id_radio', 'card');
      formdata.append('is_card', '0');

      formdata.append('is_card_one_time', '0');
      formdata.append('convenienceFee', String(watch('convenienceFee') || 0));
      formdata.append('payment_method', '1');

      formdata.append('price', Number(watch('amount') || 0).toFixed(2));

      formdata.append('payment_method_id_form', selectedCardDetails?.card_token);
      formdata.append('schedule_date', dayjs(watch('duedate')).format('MM/DD/YY'));
      formdata.append('pay_now_hidden', '1');

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
        formdata.append('make_recurring_pay', '1');
        formdata.append('recurring_pay_opt', frequency);
        formdata.append('select_repeat_options', repeatOption);
        formdata.append('repeat_an_additional_times', String(repeatTimes));
      }

      // make_recurring_pay:1
      // recurring_pay_opt:1
      // select_repeat_options:repeat_an_additional
      // repeat_an_additional_times:2"

      dispatch(
        schedulePayment(formdata, () => {
          navigate(paths.dashboard.payNow());
        })
      );
    } else {
      formdata.append('pay_payment_method', 'pay_save_method');
      formdata.append('payment_method_id_radio', 'card');
      formdata.append('is_card', '0');
      formdata.append('is_card_one_time', '0');
      if (selectedCardDetails?.bank_account_number) {
        formdata.append('is_bank_account_payment_method_form', '1');
      }
      //for bank
      // is_bank_account_payment_method_form:1"

      formdata.append('payment_method_id_form', selectedCardDetails?.card_token);

      formdata.append('convenienceFee', String(watch('convenienceFee') || 0));
      formdata.append('payment_method', '0');
      // formdata.append("price", String(watch("amount") || 0));
      formdata.append('price', Number(watch('amount') || 0).toFixed(2));

      // if (cardConvenienceFee) {
      //   const formdata = new FormData();

      //   formdata.append("acl_role_id", stored?.body?.acl_role_id);
      //   formdata.append("customer_id", stored?.body?.customer_id);
      //   formdata.append("is_one_time", "1");
      //   formdata.append("id", id);
      //   // formdata.append("pay_payment_method", "pay_save_method");
      //   formdata.append("pay_payment_method", "pay_unsave_method");
      //   formdata.append("payment_method_id_radio", "card");
      //   formdata.append("is_card", "1");
      //   formdata.append("is_card_one_time", "1");
      //   // formdata.append("payment_method_id_form", cardTransId);
      //   formdata.append("token", cardTransId);

      //   formdata.append(
      //     "convenienceFee",
      //     Number(cardConvenienceFee || 0).toFixed(2)
      //   );
      //   formdata.append("payment_method", "0");
      //   formdata.append("price", Number(cardAmount || 0).toFixed(2));

      //   // formdata.append("price", Number(watch("amount") || 0).toFixed(2));

      //   dispatch(
      //     paymentWithoutSavingDetails(
      //       stored?.body?.token,
      //       formdata,
      //       true,
      //       () => {
      //         navigate(paths.dashboard.payNow());
      //       }
      //     )
      //   );
      //   return;
      // }
      if (cardConvenienceFee) {
        const formdata = new FormData();

        formdata.append('acl_role_id', stored?.body?.acl_role_id);
        formdata.append('customer_id', stored?.body?.customer_id);
        formdata.append('is_one_time', '1');
        formdata.append('id', id);
        // formdata.append("pay_payment_method", "pay_save_method");
        formdata.append('pay_payment_method', 'pay_unsave_method');
        formdata.append('payment_method_id_radio', 'card');
        formdata.append('is_card', '1');
        formdata.append('is_card_one_time', '1');
        // formdata.append("payment_method_id_form", cardTransId);
        formdata.append('token', cardTransId);
        formdata.append('credit_card_number', card_no);
        formdata.append('card_type', card_type);
        formdata.append('expiration', expiration);

        formdata.append('convenienceFee', Number(cardConvenienceFee || 0).toFixed(2));
        formdata.append('payment_method', '0');
        formdata.append('price', Number(cardAmount || 0).toFixed(2));

        // formdata.append("price", Number(watch("amount") || 0).toFixed(2));

        dispatch(
          paymentWithoutSavingDetails(formdata, true, () => {
            navigate(paths.dashboard.payNow());
          })
        );
        return;
      }
      dispatch(
        paymentWithoutSavingDetails(formdata, true, () => {
          navigate(paths.dashboard.payNow());
        })
      );
    }
  };

  const paymentUrl = import.meta.env.VITE_PAYMENT_URL ?? '';
  const rawHTML =
    paymentDetailsInfo?.company?.optional_instructions ?? `<p><a href="${paymentUrl}">${paymentUrl}</a></p>`;

  const sanitizedHTML = DOMPurify.sanitize(rawHTML, {
    ADD_ATTR: ['target', 'rel'],
  });

  // force links to open in new tab
  const finalHTML = sanitizedHTML.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
  const billAmountDueValue =
    paymentDetailsInfo?.customer?.balance ?? myCustomerDetails?.balance ?? CustomerInfo?.balance ?? 0;
  const billAmountDueNumber = Number(String(billAmountDueValue).replace(/[^0-9.-]/g, ''));
  const billAmountDue = Number.isFinite(billAmountDueNumber) ? `$${billAmountDueNumber.toFixed(2)}` : '$0.00';
  const customerInfoDetails = CustomerInfo as
    | (CustomerInfo & {
      account_number?: string | number;
      last_bill?: { due_date?: string };
    })
    | null;
  const billDueDate =
    dueDate ??
    paymentDetailsInfo?.customer?.last_bill?.due_date ??
    customerInfoDetails?.last_bill?.due_date ??
    dashBoardInfo?.body?.customer?.last_bill?.due_date;
  const formattedBillDueDate =
    billDueDate && dayjs(billDueDate).isValid() ? dayjs(billDueDate).format('MM/DD/YYYY') : billDueDate ?? 'MM/DD/YYYY';
  const accountNumber =
    customerInfoDetails?.acctnum ??
    customerInfoDetails?.account_number ??
    paymentDetailsInfo?.customer?.acctnum ??
    paymentDetailsInfo?.customer?.account_number ??
    '-';

  return (
    <SkeletonWrapper>
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 3 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              marginBottom: 2,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '2px solid #4A79D8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CurrencyDollar size={24} weight="bold" color="#4A79D8" />
            </Box>

            <Typography
              sx={{
                color: '#2F66B3',
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                lineHeight: 1,
              }}
            >
              Payment Details
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: '#EAF6FF',
              boxShadow: '0 4px 14px rgba(23, 45, 86, 0.16)',
              borderRadius: 1,
              p: { xs: 2, sm: 3 },
              mb: 2,
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={500} color="black">
                  Account No.:
                </Typography>

                <Typography fontWeight={500} color="black" sx={{ textAlign: 'right' }}>
                  {accountNumber}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={500} color="black">
                  Bill Amount Due:
                </Typography>

                <Typography fontWeight={500} color="black" sx={{ textAlign: 'right' }}>
                  {billAmountDue}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={500} color="black">
                  Due Date
                </Typography>

                <Typography fontWeight={500} color="black" sx={{ textAlign: 'right' }}>
                  {formattedBillDueDate}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'flex-end',
              gap: 2,
              mb: 2,
            }}
          >
            {myCustomerDetails.paperless === 0 && (
              <Button
                variant="contained"
                onClick={() => navigate(paths.dashboard.paperless())}
                sx={{
                  width: { xs: '100%', sm: 240 },
                  backgroundColor: colors.blue,
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: colors['blue.3'],
                  },
                }}
              >
                <Leaf
                  color="var(--NavItem-icon-color)"
                  size={20}
                  weight="regular"
                  style={{
                    background: 'transparent',
                    fill: 'currentColor',
                    marginRight: '3px',
                  }}
                />
                GO PAPERLESS
              </Button>
            )}

            <Button
              variant="contained"
              onClick={() => navigate(paths.dashboard.autoPay())}
              sx={{
                width: { xs: '100%', sm: 240 },
                backgroundColor: colors.blue,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: colors['blue.3'],
                },
              }}
            >
              Enroll in AutoPay
            </Button>
          </Box>

          {/* Name & Email */}
          <Box sx={{}}>
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

            <Box flex={1} sx={{ mt: 1 }}>
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
          <Box sx={{ mb: 1, mt: 1 }}>
            <Typography fontWeight={600}>Amount to pay</Typography>
            <Controller
              name="amount"
              control={control}
              rules={{
                required: 'Amount is required',
                min: { value: 0, message: 'Amount must be greater than 0' },
              }}
              render={({ field }) => (
                <Tooltip
                  title={
                    paymentDetailsInfo?.company?.allow_partial_payments == 0 &&
                      paymentDetailsInfo?.company?.allow_overpayments == 0
                      ? 'Over payments are not allowed at this time. And also Partial payments are not allowed '
                      : paymentDetailsInfo?.customer?.is_payments_blocked == 1
                        ? paymentDetailsInfo?.block_individual_customer_pay_text ??
                        'Payments are not allowed at this time.'
                        : // : paymentDetailsInfo?.company?.allow_overpayments == 0
                        // ? "Over payments are not allowed at this time."
                        // : paymentDetailsInfo?.company?.allow_partial_payments == 0
                        // ? "Partial payments are not allowed"
                        ''
                  }
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: '#E7E6E6',
                        color: '#000000',
                        border: '1px solid #d0cfcf',
                        fontSize: '14px', // 👈 updated
                        lineHeight: 1.4,
                        // fontSize: '0.8rem',
                        '& .MuiTooltip-arrow': {
                          color: '#E7E6E6',
                          '&::before': {
                            border: '1px solid #d0cfcf',
                          },
                        },
                      },
                    },
                  }}
                >
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    type="text"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    InputProps={{
                      // startAdornment: <span style={{ marginRight: 0, flexShrink: 0 }}>$</span>,
                      sx: {
                        justifyContent: 'flex-end',
                        pr: { xs: 2, sm: 4 },
                      },
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      style: {
                        flex: '0 0 auto',
                        minWidth: '6ch',
                        width: `${Math.min(Math.max(String(field.value ?? '').length + 1, 6), 30)}ch`,

                        // maxWidth: 'calc(100% - 18px)',
                        textAlign: 'right',
                      },
                    }}
                    value={field.value ? `$${field.value}` : ''}
                    placeholder="$0.00"
                    disabled={
                      (paymentDetailsInfo?.company?.allow_partial_payments == 0 &&
                        paymentDetailsInfo?.company?.allow_overpayments == 0) ||
                      paymentDetailsInfo?.customer?.is_payments_blocked == 1
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d.]/g, '');
                      const sanitizedValue = value.replace(/(\..*)\./g, '$1').replace(/^(\d+\.?\d{0,2}).*$/, '$1');

                      // Prevent empty or 0
                      if (Number(sanitizedValue) < 0) {
                        toast.warn('Amount should be more than 0');
                        return;
                      }
                      if (
                        paymentDetailsInfo?.company?.allow_overpayments == 0 &&
                        Number(sanitizedValue) > paymentDetailsInfo?.customer?.balance
                      ) {
                        toast.warn('Over payments are not allowed at this time.');
                        return;
                      }

                      if (
                        paymentDetailsInfo?.company?.allow_partial_payments == 0 &&
                        Number(sanitizedValue) < paymentDetailsInfo?.customer?.balance
                      ) {
                        toast.warn('Partial payments are not allowed at this time.');
                        return;
                      }

                      field.onChange(sanitizedValue);
                    }}
                  // onBlur={(e) => {
                  //   // Also enforce on blur (in case user clears and leaves field)
                  //   if (!e.target.value || Number(e.target.value) <= 0) {
                  //     field.onChange("1");
                  //   }
                  // }}
                  />
                </Tooltip>
              )}
            />
            <Box
              sx={{
                mt: 2,
                width: '100%',
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr) minmax(0, auto)', sm: 'minmax(0, 1fr) minmax(0, 260px)' },
                rowGap: 1.5,
                columnGap: 2,
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontSize: { xs: 16, sm: 18 }, color: 'black' }}>Convenience Fee</Typography>
              <Typography
                sx={{
                  fontSize: { xs: 16, sm: 18 },
                  color: 'black',
                  textAlign: 'right',
                  pr: { xs: 2, sm: 6 },
                }}
              >
                ${Number(watch('convenienceFee') || 0).toFixed(2)}
              </Typography>

              <Box
                sx={{
                  gridColumn: '1 / -1',
                  borderTop: '1px solid #D0D0D0',
                }}
              />

              <Typography fontWeight={700} color="black">
                Total Payment
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: 'black',
                  textAlign: 'right',
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  pr: { xs: 2, sm: 6 },
                }}
              >
                ${((Number(watch('amount')) || 0) + (watch('convenienceFee') || 0)).toFixed(2)}
              </Typography>
            </Box>
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
                          onChange={(date: Dayjs | null) => field.onChange(date?.toDate())}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              required
                              error={!!errors.duedate}
                              helperText={errors.duedate?.message}
                              inputProps={{
                                ...params.inputProps,
                                readOnly: true,
                              }}
                              color="primary"
                            />
                          )}
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
            selectedCardDetails?.id && (
              <Box
                sx={{
                  border: '1.5px solid #2A72B9',
                  borderRadius: '16px',
                  p: 3,
                  mb: 3,
                  backgroundColor: '#ffffff',
                }}
              >
                <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: '#172D56', mb: 2 }}>
                  Payment Method
                </Typography>

                <RadioGroup
                  value={paymentType}
                  onChange={(e) => {
                    const val = e.target.value as 'saved' | 'no-save';
                    if (val === 'no-save') {
                      if (Number(watch('amount')) === 0) {
                        toast.warn('Amount should be more than 0');
                        return;
                      }
                    }
                    setPaymentType(val);
                  }}
                >
                  {/* Option 1: Saved Payment Method */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                    <FormControlLabel value="saved" control={<Radio color="primary" />} label="" sx={{ mr: 0 }} />

                    {/* Saved payment details box */}
                    <Box
                      onClick={() => {
                        setPaymentType('saved');
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #D6DBDF',
                        borderRadius: '8px',
                        p: '6px 12px',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#A6ACAF',
                        },
                        gap: 1.5,
                      }}
                    >
                      {renderCardBrand(paymentMethodInfoCards?.card_type ?? paymentMethodInfoCards?.account_type)}

                      <Typography sx={{ fontSize: '14px', color: '#2C3E50', fontWeight: 500 }}>
                        {paymentMethodInfoCards?.card_type || paymentMethodInfoCards?.account_type || 'Card'} ending in{' '}
                        {getCardLast4(paymentMethodInfoCards)}
                      </Typography>

                      {/* Default Badge */}
                      <Box
                        onClick={() => {
                          setOpenPaymentModal(true);
                        }}
                        sx={{
                          backgroundColor: '#E8F8F5',
                          color: '#117A65',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          px: 1,
                          py: 0.2,
                          borderRadius: '4px',
                        }}
                      >
                        Default
                      </Box>

                      {/* Caret/Chevron Icon */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', color: '#7F8C8D' }}
                        onClick={() => {
                          setOpenPaymentModal(true);
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </Box>
                    </Box>

                    {/* Add/Edit Button */}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPaymentModal(true);
                      }}
                      sx={{
                        textTransform: 'none',
                        backgroundColor: '#1E6091',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13px',
                        px: 2,
                        py: 0.5,
                        borderRadius: '4px',
                        ml: 2,
                        '&:hover': {
                          backgroundColor: '#184E77',
                        },
                      }}
                    >
                      Add/Remove
                    </Button>
                  </Box>

                  {/* Option 2: Pay this bill only */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <FormControlLabel
                      value="no-save"
                      control={<Radio color="primary" />}
                      label={
                        <Box sx={{ ml: 0.5, mt: -0.25 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '15px', color: '#E67E22' }}>
                              Pay this bill only &ndash; don't save payment method
                            </Typography>
                            {/* <Typography
                              sx={{ fontStyle: 'italic', fontSize: '13px', color: '#E67E22', fontWeight: 600 }}
                            >
                              not saved
                            </Typography> */}
                          </Box>
                          <Typography sx={{ fontSize: '13px', color: '#7F8C8D', mt: 0.5 }}>
                            Enter payment details for this transaction only.
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </RadioGroup>
              </Box>
            )
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
                    <Select value={frequency} onChange={(e) => setFrequency(e.target.value)} label="Frequency">
                      <MenuItem value="1">Every month</MenuItem>
                      <MenuItem value="2">Every 2 months</MenuItem>
                      <MenuItem value="3">Every 3 months</MenuItem>
                      <MenuItem value="6">Every 6 months</MenuItem>
                      <MenuItem value="12">Every year</MenuItem>
                    </Select>
                    <FormHelperText>
                      Recurring payments will not pay your invoice amount on the due date.
                    </FormHelperText>
                  </FormControl>

                  {/* Repeat options */}
                  <FormControl>
                    <RadioGroup value={repeatOption} onChange={(e) => setRepeatOption(e.target.value)}>
                      {/* First Option */}
                      <FormControlLabel
                        value="repeat_indefinitely"
                        control={<Radio />}
                        label="Repeat indefinitely"
                        sx={{
                          width: '220px',
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
                              onChange={(e) => setRepeatTimes(Number(e.target.value))}
                              sx={{ width: 80 }}
                              disabled={repeatOption !== 'repeat_an_additional'}
                            >
                              {Array.from(Array(25).keys()).map((n) => (
                                <MenuItem key={n + 1} value={n + 1}>
                                  {n + 1}
                                </MenuItem>
                              ))}
                            </Select>
                            <Typography>times after the first payment</Typography>
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
          {paymentType === 'saved' ? (
            paymentDetailsInfo?.company?.allow_payments == 0 ? (
              <Box
                className="instructions-html"
                sx={{
                  '& a': {
                    color: 'red !important', // this WILL override MUI tabs
                    textDecoration: 'none',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: finalHTML }}
              />
            ) : paymentDetailsInfo?.customer?.is_payments_blocked == 1 ? (
              <Typography variant="body2" mt={2} color="red" fontWeight="bold">
                {paymentDetailsInfo?.block_individual_customer_pay_text ?? 'Payments are not allowed at this time.'}
              </Typography>
            ) : selectedCardDetails?.id ? (
              <Box sx={{ display: 'flex', flexDirection: 'space-between', mt: 3 }}>
                <Button
                  onClick={() => navigate(-1)}
                  variant="outlined"
                  sx={{ color: colors.blue, borderColor: colors.blue, mb: 1, px: 4 }}
                >
                  {' Back'}
                </Button>
                <Button
                  onClick={() => {
                    if (Number(watch('amount')) <= 0) {
                      toast.warn('Amount should be more than 0');
                      return;
                    }
                    setShowPaymentSummary(true);
                  }}
                  variant="contained"
                  sx={{
                    mb: 1,
                    px: 4,
                    fontWeight: 'bold',

                    backgroundColor: colors.blue,
                    '&:hover': {
                      backgroundColor: colors['blue.3'], // or any other hover color
                    },
                  }}
                  style={{
                    marginLeft: 'auto',
                  }}
                >
                  {isSchedule ? 'Schedule a Payment' : ' CONFIRM PAYMENT'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      onChange={(e) => setSaveThisPaymentForFuture(e.target.checked)}
                      value={saveThisPaymentForFuture}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ color: 'text.primary', fontSize: '15px' }}>
                        Save payment method for future payments
                      </Typography>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: '13px',
                          fontStyle: 'italic',
                        }}
                      >
                        You can manage or remove it in Payment Methods
                      </Typography>
                    </Box>
                  }
                  sx={{
                    mb: 2,
                  }}
                />

                <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <RadioGroup
                    row
                    value={debitType}
                    onChange={(e) => setDebitType(e.target.value as 'card' | 'bank_account')}
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
                            sx={{
                              position: 'relative',
                              display: 'inline-block',
                              top: 3,
                            }}
                          >
                            {/* Question Icon */}
                            <Question size={20} color="#5dade2" weight="fill" />

                            {/* Image popup */}
                            {hovered && (
                              <Box
                                component="img"
                                // src="/public/assets/bankaccount-help.png"
                                src={`${BASE_URL}/resources/front/images/bankaccount-help.png`}
                                alt="Help"
                                sx={{
                                  position: 'absolute',
                                  top: '30px', // below icon
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  width: 350,
                                  height: 350,
                                  borderRadius: 2,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  zIndex: 999,
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </Box>
                <PaymentIframe
                  type={debitType == 'card' ? 'card' : 'account'}
                  onSuccess={(data: CardDetails) => setCardBankDetails(data)}
                  invoiceId={id}
                  convenience_fee={String(watch('convenienceFee') || 0)}
                  amount={(Number(watch('amount')) || 0).toFixed(2)}
                  amountRequired={true}
                />
              </Box>
            )
          ) : (
            <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <RadioGroup
                row
                value={debitType}
                onChange={(e) => setDebitType(e.target.value as 'card' | 'bank_account')}
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
                        sx={{
                          position: 'relative',
                          display: 'inline-block',
                          top: 3,
                        }}
                      >
                        {/* Question Icon */}
                        <Question size={20} color="#5dade2" weight="fill" />

                        {/* Image popup */}
                        {hovered && (
                          <Box
                            component="img"
                            // src="/public/assets/bankaccount-help.png"
                            src={`${BASE_URL}/resources/front/images/bankaccount-help.png`}
                            alt="Help"
                            sx={{
                              position: 'absolute',
                              top: '30px', // below icon
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 350,
                              height: 350,
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              zIndex: 999,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </Box>
          )}
        </form>

        {paymentType === 'no-save' ? (
          paymentDetailsInfo?.company?.allow_payments == 0 ? (
            <Box
              className="instructions-html"
              sx={{
                '& a': {
                  color: 'red !important', // this WILL override MUI tabs
                  textDecoration: 'none',
                },
              }}
              dangerouslySetInnerHTML={{ __html: finalHTML }}
            />
          ) : paymentDetailsInfo?.customer?.is_payments_blocked == 1 ? (
            <Typography variant="body2" mt={2} color="red" fontWeight="bold">
              {paymentDetailsInfo?.block_individual_customer_pay_text ?? 'Payments are not allowed at this time.'}
            </Typography>
          ) : Number(watch('amount')) <= 0 ? (
            <Typography color="error" textAlign={'center'}>
              Amount must be greater than 0 to proceed for the payment{' '}
            </Typography>
          ) : (
            <PaymentIframe
              type={debitType == 'card' ? 'card' : 'account'}
              onSuccess={(data: CardDetails) => setCardBankDetails(data)}
              invoiceId={id}
              convenience_fee={String(watch('convenienceFee') || 0)}
              amount={(Number(watch('amount')) || 0).toFixed(2)}
              amountRequired={true}
            />
          )
        ) : null}

        {openPaymentModal && (
          <Dialog
            open={openPaymentModal}
            scroll="paper"
            fullWidth
            maxWidth={false} // ✅ disable preset sizes
            PaperProps={{
              sx: {
                maxHeight: '90vh',
                width: Object.keys(myCard || {}).length ? '830px' : '800px', // ✅ custom fixed width
                borderRadius: '12px',
              },
            }}
          >
            <PaymentMethods
              onClose={() => {
                setOpenPaymentModal(false);
              }}
              isModal={true}
              count={10}
              page={1}
              rows={[]}
              rowsPerPage={10}
              onSaveCardDetails={(data: any) => {
                console.log(data, 'fdddfdf');
                try {
                  setSelectedCardDetails(data);
                  setOpenConfirm(true);
                } catch {
                  console.error('Failed to parse card details');
                }
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
            amount={cardAmount ? Number(cardAmount) : Number(amount || cardAmount || 0)}
            fee={cardConvenienceFee ? Number(cardConvenienceFee) : Number(watch('convenienceFee') || 0)}
            cardType={
              cardConvenienceFee && cardAmount && cardTransId
                ? 'card'
                : cardBankDetails
                  ? cardBankDetails?.cardType ?? cardBankDetails?.ssl_card_short_description ?? 'Bank Account'
                  : selectedCardDetails?.card_type || 'Bank Account'
            }
            cardLast4={
              cardConvenienceFee && cardAmount && cardTransId
                ? maskValue(cardTransId)
                : cardBankDetails
                  ? cardBankDetails?.cardNumber ?? cardBankDetails?.ssl_card_number ?? cardBankDetails?.accountNumber
                  : selectedCardDetails?.card_number ?? selectedCardDetails?.bank_account_number
            }
            dueDate={isSchedule ? watch('duedate') : null}
            Recurring={recurringPaymentEnabled ? frequency : null}
            Payment={
              recurringPaymentEnabled
                ? repeatOption == 'repeat_indefinitely'
                  ? 'Thereafter'
                  : String(repeatTimes)
                : null
            }
          />
        )}
        {openConfirm && (
          <ConfirmDialog
            open={openConfirm}
            title={'Default payment method?'}
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
            title={'Customer Acknowledgement'}
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
        <CustomBackdrop open={accountLoading} style={{ zIndex: 1300, color: '#fff' }}>
          <Loader />
        </CustomBackdrop>
      </Box>
    </SkeletonWrapper>
  );
};

export default PaymentForm;
