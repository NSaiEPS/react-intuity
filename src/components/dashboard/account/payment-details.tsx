import React, { useEffect, useState } from 'react';
import { BASE_URL } from '@/api/axios';
import { getConvenienceFeeAPI } from '@/api/dashboard';
import {
  getPaymentDetails,
  getPaymentProcessorDetails,
  paymentWithoutSavingDetails,
  saveAcknowledgeForRecurringPayment,
  saveDefaultPaymentMethod,
  schedulePayment,
  setConvenienceFee,
} from '@/state/features/accountSlice';
import { RootState } from '@/state/store';
import { colors, CustomerInfo, decryptFunction, getPaymentMethodType, maskValue } from '@/utils';
import { getLocalStorage, IntuityUser } from '@/utils/auth';
import { navigateTo } from '@/utils/navigation';
import { paths } from '@/utils/paths';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
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

import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
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
import { formatCurrency } from '@/utils/formatters';
import { decrypt } from '@/utils/crypto';

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
  card_token?: string;

  id?: string;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;

  [key: string]: unknown;
}

export const getCardLast4 = (selectedCardDetails: CardDetails) => {
  if (!selectedCardDetails) return '';
  const num = selectedCardDetails?.card_number
    ? decryptFunction(String(selectedCardDetails.card_number))
    : selectedCardDetails?.bank_account_number
      ? decryptFunction(String(selectedCardDetails.bank_account_number))
      : selectedCardDetails?.card_no
        ? decryptFunction(String(selectedCardDetails.card_no))
        : selectedCardDetails?.number
          ? decryptFunction(String(selectedCardDetails.number))
          : selectedCardDetails?.last4 ?? '';
  const str = String(num || '').trim();
  return str ? str.slice(-4) : '';
};

const PaymentForm = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
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
  const [isAmountFocused, setIsAmountFocused] = React.useState(false);
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [debitType, setDebitType] = useState<'card' | 'bank_account'>('card');
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const { setContextLoading } = useLoading();
  const location = useLocation();
  const { isSchedule, dueDate, customer_acknowledgement_text = '' } = location.state || {};
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
    // handled via handlePay / handleSaveDetails
  };
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);
  const accountLoading = useSelector((state: RootState) => state?.Account.accountLoading);
  const convenienceFee = useSelector((state: RootState) => state?.Account.convenienceFee);
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);

  const raw = userInfo?.body ? userInfo : getLocalStorage('intuity-user');

  const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;
  const navigate = useNavigate();
  const myCard = useSelector((state: RootState) => state?.Account?.paymentMethodInfoCards);
  const paymentMethodInfoCards = useSelector((state: RootState) => state?.Account?.selectedCardInfo);
  const paymentDetailsInfo = useSelector((state: RootState) => state?.Account?.paymentDetailsInfo);

  useEffect(() => {
    if (paymentDetailsInfo?.customer?.balance) {
      setValue('amount', paymentDetailsInfo?.customer?.balance);
    }
  }, [paymentDetailsInfo]);

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
      setHasUserChangedPaymentType(false);
    }
    if (CustomerInfo?.company_id) {
      const formdata = new FormData();
      formdata.append('acl_role_id', stored?.body?.acl_role_id);
      formdata.append('company_id', CustomerInfo?.company_id);
      dispatch(getPaymentProcessorDetails(formdata, false));
    }
  }, [CustomerInfo]);

  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { id: encryptedId } = useParams();

  let id = "";

  try {
    if (!encryptedId || typeof encryptedId !== "string") {
      throw new Error("Missing id");
    }

    id = decrypt(encryptedId);
  } catch (err) {
    navigate("/errors/not-found", {
      replace: true,
      state: {
        title: "Invalid URL",
        description: "Please use a valid payment link.",
      },
    });
    return;
  }
  const transId = searchParams.get('transId');

  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const [cardBankDetails, setCardBankDetails] = useState<any>(null);

  // Extract saved cards list
  const extractCards = React.useCallback((data: any): CardDetails[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
      return Object.values(data).filter(
        (item: any) =>
          item &&
          typeof item === 'object' &&
          (item.id || item.card_token || item.bank_account_number || item.card_number || item.account_type || item.card_type)
      ) as CardDetails[];
    }
    return [];
  }, []);

  const savedCardsList: CardDetails[] = React.useMemo(() => {
    let cards: CardDetails[] = [];
    if (paymentDetailsInfo && Object.keys(paymentDetailsInfo).length > 0) {
      const directMyCards = paymentDetailsInfo.mycards ?? paymentDetailsInfo.customer?.mycards;
      if (directMyCards !== undefined && directMyCards !== null) {
        cards = extractCards(directMyCards);
      }
    }
    if (cards.length === 0 && myCard && Object.keys(myCard).length > 0) {
      cards = extractCards(myCard);
    }
    if (cards.length === 0 && dashBoardInfo?.body?.customer?.mycards) {
      cards = extractCards(dashBoardInfo.body.customer.mycards);
    }
    return cards;
  }, [paymentDetailsInfo, myCard, dashBoardInfo, extractCards]);

  const hasSavedPaymentMethods = savedCardsList.length > 0;

  const getCardKey = React.useCallback((card: CardDetails | null | undefined): string => {
    if (!card) return '';
    return String(card.id ?? card.card_token ?? card.card_id ?? card.card_number ?? card.bank_account_number ?? '');
  }, []);

  const formatPaymentMethodLabel = React.useCallback((method: CardDetails | null | undefined): string => {
    if (!method) return 'Saved Payment Method';
    const isBank = Boolean(
      method?.bank_account_number ||
      method?.account_type ||
      method?.isBank ||
      (method?.type && String(method.type).toLowerCase() === 'account')
    );
    const type = method?.card_type || method?.account_type || (isBank ? 'Bank Account' : 'Card');
    const last4 = getCardLast4(method);
    return `${type}${last4 ? ` ending in ${last4}` : ''}`;
  }, []);

  const [selectedCardDetails, setSelectedCardDetails] = useState<CardDetails>({});
  const [hasUserChangedPaymentType, setHasUserChangedPaymentType] = useState(false);

  // Synchronize selectedCardDetails with savedCardsList / default selection
  useEffect(() => {
    if (hasSavedPaymentMethods) {
      if (!hasUserChangedPaymentType) {
        setPaymentType('saved');
      }
      const currentKey = getCardKey(selectedCardDetails);
      const exists = savedCardsList.some((c) => getCardKey(c) === currentKey);
      if (!currentKey || !exists) {
        const defaultCard =
          savedCardsList.find(
            (c: any) =>
              c.is_default === 1 ||
              c.is_default === true ||
              c.default === 1 ||
              c.default === true ||
              c.default_payment === 1 ||
              c.default_payment === '1'
          ) ||
          (paymentMethodInfoCards && getCardKey(paymentMethodInfoCards) ? paymentMethodInfoCards : null) ||
          savedCardsList[0];

        if (defaultCard) {
          setSelectedCardDetails(defaultCard);
        }
      }
    } else {
      setSelectedCardDetails({});
      if (!hasUserChangedPaymentType) {
        setPaymentType('no-save');
      }
    }
  }, [hasSavedPaymentMethods, savedCardsList, paymentMethodInfoCards, getCardKey, selectedCardDetails, hasUserChangedPaymentType]);

  // Handle saving details (one-time or with save checkbox)
  const handleSaveDetails = (data: any, selectedDebitType: 'card' | 'bank_account') => {
    if (data?.error) {
      toast.error(data?.error ? data?.error : 'Try again something went wrong!');
      return;
    }

    // If user checked "Save payment method for future payments", save it first as default
    if (saveThisPaymentForFuture) {
      const saveFormdata = new FormData();
      saveFormdata.append('acl_role_id', stored?.body?.acl_role_id);
      saveFormdata.append('customer_id', stored?.body?.customer_id);
      saveFormdata.append('model_open', '1');

      if (selectedDebitType === 'card') {
        if (data?.ssl_token) {
          saveFormdata.append('token', data?.ssl_token);
          saveFormdata.append('credit_card_number', data?.ssl_card_number);
          saveFormdata.append('card_type', data?.ssl_card_short_description);
          saveFormdata.append('expiration', data?.ssl_exp_date);
          saveFormdata.append('approval_code', data?.ssl_approval_code);
        } else if (data?.forte_response || data?.forte_token) {
          const forteResp = data?.forte_response;
          const forteToken = String(forteResp?.onetime_token ?? data?.forte_token ?? data?.token ?? '');
          const last4 = String(forteResp?.last_4 ?? data?.credit_card_number ?? data?.cardNumber ?? '');
          const cardType = String(forteResp?.card_type ?? data?.card_type ?? data?.cardType ?? '');
          const expMonth = String(forteResp?.expire_month ?? '').padStart(2, '0');
          const expYearRaw = String(forteResp?.expire_year ?? '');
          const expYearFull = expYearRaw.length === 2 ? `20${expYearRaw}` : expYearRaw;
          const expirationFormatted = expMonth && expYearFull ? `${expMonth}/${expYearFull}` : String(data?.expiration ?? '');

          saveFormdata.append('token', forteToken);
          saveFormdata.append('credit_card_number', last4);
          saveFormdata.append('card_type', cardType);
          saveFormdata.append('expiration', expirationFormatted);
        } else {
          saveFormdata.append('token', data?.token);
          saveFormdata.append('credit_card_number', data?.cardNumber);
          saveFormdata.append('card_type', data?.cardType);
          saveFormdata.append('expiration', data?.cardExpDate ?? data?.expiration);
        }
      } else {
        saveFormdata.append('token', data?.token ?? data?.forte_token);
        saveFormdata.append('bank_account_number', data?.accountNumber ?? data?.bank_account_number);
        saveFormdata.append('routing_number', data?.routingNumber ?? data?.routing_number);
        saveFormdata.append(
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
                    : data?.accountType || ' Other'
        );
      }

      dispatch(getPaymentDetails(saveFormdata, true));
    }

    const formdata = new FormData();
    formdata.append('acl_role_id', stored?.body?.acl_role_id);
    formdata.append('customer_id', stored?.body?.customer_id);
    formdata.append('is_one_time', '1');
    formdata.append('id', id);

    formdata.append('pay_payment_method', 'pay_unsave_method');
    formdata.append('payment_method_id_radio', selectedDebitType);
    formdata.append('is_card', selectedDebitType === 'card' ? '1' : '0');

    // for card
    if (selectedDebitType === 'card') {
      if (data?.ssl_token) {
        formdata.append('salestax', '0');
        formdata.append('credit_card_number', data?.ssl_card_number);
        formdata.append('card_type', data?.ssl_card_short_description);
        formdata.append('expiration', data?.ssl_exp_date);
        formdata.append('approval_code', data?.ssl_approval_code);
        formdata.append('is_card_one_time', '1');
        formdata.append('paytype_category', data?.ssl_card_short_description);
      } else if (data?.forte_response || data?.forte_token) {
        const forteResp = data?.forte_response;
        const forteToken = String(forteResp?.onetime_token ?? data?.forte_token ?? data?.token ?? '');
        const last4 = String(forteResp?.last_4 ?? data?.credit_card_number ?? data?.cardNumber ?? '');
        const cardType = String(forteResp?.card_type ?? data?.card_type ?? data?.cardType ?? '');

        const expMonth = String(forteResp?.expire_month ?? '').padStart(2, '0');
        const expYearRaw = String(forteResp?.expire_year ?? '');
        const expYearFull = expYearRaw.length === 2 ? `20${expYearRaw}` : expYearRaw;
        const expirationFormatted = expMonth && expYearFull ? `${expMonth}/${expYearFull}` : String(data?.expiration ?? '');

        formdata.append('is_card_one_time', '1');
        formdata.append('forte_token', forteToken);
        if (forteResp) {
          formdata.append('forte_response', typeof forteResp === 'string' ? forteResp : JSON.stringify(forteResp));
        }
        formdata.append('credit_card_number', last4);
        formdata.append('card_type', cardType);
        formdata.append('expiration', expirationFormatted);
      } else {
        formdata.append('credit_card_number', data?.cardNumber);
        formdata.append('card_type', data?.cardType);
        formdata.append('expiration', data?.cardExpDate);
        formdata.append('is_card_one_time', '1');
      }
    }
    if (selectedDebitType === 'bank_account') {
      if ('expiration' in data) {
        formdata.append('expiration', '');
      }

      formdata.append('bank_account_number', data?.accountNumber);
      formdata.append('routing_number', data?.routingNumber);
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
      if (data?.forte_token) {
        formdata.append('forte_token', data.forte_token);
      }
      if (data?.forte_response) {
        formdata.append(
          'forte_response',
          typeof data.forte_response === 'string' ? data.forte_response : JSON.stringify(data.forte_response)
        );
      }
    }
    formdata.append('token', data?.ssl_token ?? data?.forte_token ?? data?.token);
    formdata.append('payment_method', '0');
    formdata.append('price', Number(watch('amount') || 0).toFixed(2));
    formdata.append('convenienceFee', Number(watch('convenienceFee') || 0).toFixed(2));

    dispatch(
      paymentWithoutSavingDetails(formdata, true, () => {
        navigate(paths.dashboard.lastBill());
      })
    );
  };

  const onSaveCardDetails = () => {
    const cardNum = selectedCardDetails.card_token;

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
      })
    );
  };
  const [openConfirm, setOpenConfirm] = useState(false);

  const amount = watch('amount');
  const [debouncedAmount, setDebouncedAmount] = useState(amount);

  // Update debounced amount when user stops typing (600ms delay)
  useEffect(() => {
    if (amount !== debouncedAmount) {
      setIsFeeLoading(true);
    }
    const handler = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 600);
    return () => clearTimeout(handler);
  }, [amount, debouncedAmount]);

  const extractFeeFromResponse = (resData: any): number => {
    if (typeof resData === 'number') return resData;
    if (typeof resData === 'string') return parseFloat(resData) || 0;
    if (resData && typeof resData === 'object') {
      const val = resData.convenience_fee ?? resData.fee_amount ?? resData.convenienceFee ?? resData.fee ?? 0;
      return parseFloat(String(val)) || 0;
    }
    return 0;
  };

  const fetchConvenienceFee = React.useCallback(
    async (amtToUse?: string) => {
      const targetAmount = amtToUse !== undefined ? amtToUse : watch('amount');
      const numericAmount = parseFloat(targetAmount || '0');
      if (numericAmount <= 0) {
        setValue('convenienceFee', 0);
        setIsFeeLoading(false);
        return;
      }

      const aclRoleId = stored?.body?.acl_role_id ? Number(stored.body.acl_role_id) : 4;
      const customerId = stored?.body?.customer_id ? Number(stored.body.customer_id) : 0;

      const isBankAccount =
        paymentType === 'saved' && hasSavedPaymentMethods
          ? Boolean(selectedCardDetails?.bank_account_number || selectedCardDetails?.account_type || selectedCardDetails?.isBank)
          : debitType === 'bank_account';

      const cardTypeOrBrand =
        paymentType === 'saved' && hasSavedPaymentMethods
          ? (selectedCardDetails?.card_type || selectedCardDetails?.brand || selectedCardDetails?.account_type)
          : undefined;

      const paymentMethodType = getPaymentMethodType({
        isBank: isBankAccount,
        cardType: cardTypeOrBrand,
      });

      const payload = {
        acl_role_id: aclRoleId,
        customer_id: customerId,
        amount: numericAmount.toFixed(2),
        payment_method_type: paymentMethodType,
      };

      setIsFeeLoading(true);
      try {
        const res = await getConvenienceFeeAPI(payload);
        if (res?.status) {
          dispatch(setConvenienceFee(res?.body));
          const fee = extractFeeFromResponse(res?.body);
          setValue('convenienceFee', fee);
        } else {
          navigateTo('/login', { replace: true }, res?.message);
          if (res?.message !== 'You are not authorised to use this api') {
            toast.error(res?.message ?? 'Something went wrong!');
          }
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message ?? 'Error Try again!!');
      } finally {
        setIsFeeLoading(false);
      }
    },
    [watch, stored?.body?.acl_role_id, stored?.body?.customer_id, paymentType, hasSavedPaymentMethods, selectedCardDetails?.bank_account_number, selectedCardDetails?.card_type, selectedCardDetails?.brand, selectedCardDetails?.account_type, selectedCardDetails?.isBank, debitType, dispatch, setValue]
  );

  // Trigger fee API call when debounced amount changes or payment method changes
  useEffect(() => {
    fetchConvenienceFee(debouncedAmount);
  }, [debouncedAmount, fetchConvenienceFee]);

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

  const cardConvenienceFee = searchParams.get('convenience_fee');
  const cardAmount = searchParams.get('amount');
  const cardTransId = searchParams.get('transId');
  const card_no = searchParams.get('card_no');
  const card_type = searchParams.get('card_type');
  const expiration = searchParams.get('expiration');

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
      formdata.append('payment_method_id_radio', 'card');
      formdata.append('is_card', '0');
      formdata.append('is_card_one_time', '0');
      formdata.append('convenienceFee', String(watch('convenienceFee') || 0));
      formdata.append('payment_method', '1');
      formdata.append('price', Number(watch('amount') || 0).toFixed(2));
      formdata.append('payment_method_id_form', selectedCardDetails?.card_token);
      formdata.append('schedule_date', dayjs(watch('duedate')).format('MM/DD/YY'));
      formdata.append('pay_now_hidden', '1');

      if (recurringPaymentEnabled) {
        formdata.append('make_recurring_pay', '1');
        formdata.append('recurring_pay_opt', frequency);
        formdata.append('select_repeat_options', repeatOption);
        formdata.append('repeat_an_additional_times', String(repeatTimes));
      }

      dispatch(
        schedulePayment(formdata, () => {
          navigate(paths.dashboard.lastBill());
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

      formdata.append('payment_method_id_form', selectedCardDetails?.card_token);
      formdata.append('convenienceFee', String(watch('convenienceFee') || 0));
      formdata.append('payment_method', '0');
      formdata.append('price', Number(watch('amount') || 0).toFixed(2));

      if (cardConvenienceFee) {
        const urlFormdata = new FormData();
        urlFormdata.append('acl_role_id', stored?.body?.acl_role_id);
        urlFormdata.append('customer_id', stored?.body?.customer_id);
        urlFormdata.append('is_one_time', '1');
        urlFormdata.append('id', id);
        urlFormdata.append('pay_payment_method', 'pay_unsave_method');
        urlFormdata.append('payment_method_id_radio', 'card');
        urlFormdata.append('is_card', '1');
        urlFormdata.append('is_card_one_time', '1');
        urlFormdata.append('token', cardTransId);
        urlFormdata.append('credit_card_number', card_no);
        urlFormdata.append('card_type', card_type);
        urlFormdata.append('expiration', expiration);
        urlFormdata.append('convenienceFee', Number(cardConvenienceFee || 0).toFixed(2));
        urlFormdata.append('payment_method', '0');
        urlFormdata.append('price', Number(cardAmount || 0).toFixed(2));

        dispatch(
          paymentWithoutSavingDetails(urlFormdata, true, () => {
            navigate(paths.dashboard.lastBill());
          })
        );
        return;
      }
      dispatch(
        paymentWithoutSavingDetails(formdata, true, () => {
          navigate(paths.dashboard.lastBill());
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

  const finalHTML = sanitizedHTML.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
  const billAmountDueValue =
    paymentDetailsInfo?.customer?.balance ?? myCustomerDetails?.balance ?? CustomerInfo?.balance ?? 0;
  const billAmountDueNumber = Number(String(billAmountDueValue).replace(/[^0-9.-]/g, ''));
  const billAmountDue = Number.isFinite(billAmountDueNumber) ? formatCurrency(billAmountDueNumber) : '$0.00';
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

  const isAutopayEnabled =
    Number(CustomerInfo?.autopay) === 1 ||
    Number(dashBoardInfo?.body?.customer?.autopay) === 1 ||
    Number(dashBoardInfo?.customer?.autopay) === 1 ||
    Number(paymentDetailsInfo?.customer?.autopay) === 1;

  const totalCalculatedAmount = (Number(watch('amount')) || 0) + (Number(watch('convenienceFee')) || 0);

  return (
    <SkeletonWrapper>
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, sm: 3 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Page Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              marginBottom: 2.5,
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

          {/* Billing Information Section */}
          <Box
            sx={{
              backgroundColor: '#EAF6FF',
              boxShadow: '0 4px 14px rgba(23, 45, 86, 0.12)',
              borderRadius: 2,
              p: { xs: 2.5, sm: 3 },
              mb: 2.5,
              border: '1px solid #D2E7F9',
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={500} color="text.secondary">
                  Account No.:
                </Typography>
                <Typography fontWeight={600} color="text.primary" sx={{ textAlign: 'right' }}>
                  {accountNumber}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={500} color="text.secondary">
                  Amount Due:
                </Typography>
                <Typography fontWeight={600} color="text.primary" sx={{ textAlign: 'right' }}>
                  {billAmountDue}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={500} color="text.secondary">
                  Due Date:
                </Typography>
                <Typography fontWeight={600} color="text.primary" sx={{ textAlign: 'right' }}>
                  {formattedBillDueDate}
                </Typography>
              </Stack>

              <Box sx={{ borderTop: '1px solid rgba(47, 102, 179, 0.2)', pt: 1.5, mt: 0.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={700} color="#172D56">
                    Total Payment Amount:
                  </Typography>
                  {isFeeLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={18} sx={{ color: '#2A72B9' }} /> Updating...
                    </Box>
                  ) : (
                    <Typography variant="h6" fontWeight={800} color="#2F66B3" sx={{ textAlign: 'right' }}>
                      {formatCurrency(totalCalculatedAmount)}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Action Buttons: AutoPay & Paperless */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'flex-end',
              gap: 2,
              mb: 2.5,
            }}
          >
            {myCustomerDetails.paperless === 0 && (
              <Button
                variant="contained"
                onClick={() => navigate(paths.dashboard.paperless())}
                sx={{
                  width: { xs: '100%', sm: 240 },
                  fontWeight: 700,
                  textTransform: 'none',
                  backgroundColor: colors.blue,
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

            {!isAutopayEnabled && (
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
            )}
          </Box>

          {/* Name & Email for Receipt */}
          <Box sx={{ mb: 1.5 }}>
            <Box flex={1}>
              <Typography fontWeight={600}>Name for Payment Receipt</Typography>
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

            <Box flex={1} sx={{ mt: 1.5 }}>
              <Typography fontWeight={600}>Email for Payment Receipt</Typography>
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

          {/* Amount to Pay */}
          <Box sx={{ mb: 2, mt: 1 }}>
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
                        : ''
                  }
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: '#E7E6E6',
                        color: '#000000',
                        border: '1px solid #d0cfcf',
                        fontSize: '14px',
                        lineHeight: 1.4,
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
                      sx: {
                        justifyContent: 'flex-end',
                        pr: 0,
                      },
                    }}
                    inputProps={{
                      inputMode: 'decimal',
                      style: {
                        flex: '0 0 auto',
                        minWidth: '6ch',
                        textAlign: 'right',
                      },
                    }}
                    value={
                      field.value
                        ? isAmountFocused
                          ? `$${field.value}`
                          : formatCurrency(field.value)
                        : ''
                    }
                    placeholder="$0.00"
                    disabled={
                      (paymentDetailsInfo?.company?.allow_partial_payments == 0 &&
                        paymentDetailsInfo?.company?.allow_overpayments == 0) ||
                      paymentDetailsInfo?.customer?.is_payments_blocked == 1
                    }
                    onFocus={(e) => {
                      setIsAmountFocused(true);
                      requestAnimationFrame(() => {
                        const len = e.target.value.length;
                        e.target.setSelectionRange(len, len);
                      });
                    }}
                    onBlur={() => {
                      setIsAmountFocused(false);
                      field.onBlur();
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d.]/g, '');
                      const sanitizedValue = value.replace(/(\..*)\./g, '$1').replace(/^(\d+\.?\d{0,2}).*$/, '$1');

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
              <Typography sx={{ fontSize: 16, color: 'black' }}>Convenience Fee</Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  pr: '14px',
                  minHeight: '24px',
                }}
              >
                {isFeeLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={18} sx={{ color: '#2A72B9' }} /> Updating...
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      fontSize: 16,
                      color: 'black',
                      textAlign: 'right',
                    }}
                  >
                    {formatCurrency(Number(watch('convenienceFee') || 0))}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  gridColumn: '1 / -1',
                  borderTop: '1px solid #D0D0D0',
                }}
              />

              <Typography fontWeight={700} color="black" mb={1}>
                Total Payment
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  pr: '14px',
                  minHeight: '24px',
                  mb: 1,
                }}
              >
                {isFeeLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={18} sx={{ color: '#2A72B9' }} /> Updating...
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: 'black',
                      textAlign: 'right',
                      minWidth: 0,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {formatCurrency(totalCalculatedAmount)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Schedule / Recurring Options */}
          {isSchedule && (
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
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
              </Grid>
            </Box>
          )}

          {isSchedule && (
            <Box display="flex" flexDirection="column" gap={2} mb={2.5}>
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
                      Your recurring payment is for a fixed amount and may not cover your entire utility bill each billing period.
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <RadioGroup value={repeatOption} onChange={(e) => setRepeatOption(e.target.value)}>
                      <FormControlLabel
                        value="repeat_indefinitely"
                        control={<Radio />}
                        label="Repeat indefinitely"
                        sx={{ width: '220px' }}
                      />

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

          {/* Payment Method Selection Card */}
          <Box
            sx={{
              border: '1.5px solid #2A72B9',
              borderRadius: '16px',
              p: { xs: 2, sm: 3 },
              mb: 3,
              backgroundColor: '#ffffff',
            }}
          >
            <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: '#172D56', mb: 2 }}>
              {hasSavedPaymentMethods ? 'Payment Method' : 'Payment Information'}
            </Typography>

            {/* SCENARIO B: Customer HAS Saved Payment Method(s) */}
            {hasSavedPaymentMethods ? (
              <Box>
                <RadioGroup
                  value={paymentType}
                  onChange={(e) => {
                    const val = e.target.value as 'saved' | 'no-save';
                    setHasUserChangedPaymentType(true);
                    setPaymentType(val);
                  }}
                >
                  {/* Option 1: Use a Saved Payment Method */}
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      value="saved"
                      control={<Radio color="primary" sx={{ p: '9px' }} />}
                      label={
                        <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#172D56' }}>
                          Use a Saved Payment Method
                        </Typography>
                      }
                      sx={{ m: 0, mr: 0, alignItems: 'center' }}
                    />

                    {/* Saved Payment Method Dropdown + Add/Edit Button */}
                    {paymentType === 'saved' && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'stretch', sm: 'center' },
                          gap: 1.5,
                          mt: 1.5,
                          ml: { xs: 0, sm: 4 },
                          width: { xs: '100%', sm: 'calc(100% - 32px)' },
                        }}
                      >
                        <FormControl size="small" sx={{ flex: 1, minWidth: { xs: '100%', sm: 280 } }}>
                          <InputLabel id="saved-payment-method-select-label">Saved Payment Method</InputLabel>
                          <Select
                            labelId="saved-payment-method-select-label"
                            id="saved-payment-method-select"
                            label="Saved Payment Method"
                            value={getCardKey(selectedCardDetails)}
                            onChange={(e) => {
                              const chosen = savedCardsList.find((c) => getCardKey(c) === e.target.value);
                              if (chosen) {
                                setSelectedCardDetails(chosen);
                              }
                            }}
                            renderValue={(selectedKey) => {
                              const chosen =
                                savedCardsList.find((c) => getCardKey(c) === selectedKey) || selectedCardDetails;
                              const isDefault = Boolean(
                                chosen?.is_default === 1 ||
                                chosen?.is_default === true ||
                                chosen?.default === 1 ||
                                chosen?.default === true ||
                                chosen?.default_payment === 1 ||
                                chosen?.default_payment === '1'
                              );
                              return (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                                  <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                    {renderCardBrand(chosen?.card_type ?? chosen?.account_type)}
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: '14px',
                                      color: '#2C3E50',
                                      fontWeight: 500,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {formatPaymentMethodLabel(chosen)}
                                  </Typography>
                                  {isDefault && (
                                    <Box
                                      sx={{
                                        backgroundColor: '#E8F8F5',
                                        color: '#117A65',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        px: 1,
                                        py: 0.2,
                                        borderRadius: '4px',
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap',
                                        ml: 'auto',
                                      }}
                                    >
                                      Default
                                    </Box>
                                  )}
                                </Box>
                              );
                            }}
                            sx={{
                              backgroundColor: '#ffffff',
                              borderRadius: '8px',
                              '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                py: '8.5px',
                              },
                            }}
                          >
                            {savedCardsList.map((card) => {
                              const key = getCardKey(card);
                              const isDefault = Boolean(
                                card?.is_default === 1 ||
                                card?.is_default === true ||
                                card?.default === 1 ||
                                card?.default === true ||
                                card?.default_payment === 1 ||
                                card?.default_payment === '1'
                              );
                              return (
                                <MenuItem key={key} value={key} sx={{ py: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                      {renderCardBrand(card?.card_type ?? card?.account_type)}
                                    </Box>
                                    <Typography sx={{ fontSize: '14px', color: '#2C3E50', fontWeight: 500, flex: 1 }}>
                                      {formatPaymentMethodLabel(card)}
                                    </Typography>
                                    {isDefault && (
                                      <Box
                                        sx={{
                                          backgroundColor: '#E8F8F5',
                                          color: '#117A65',
                                          fontSize: '11px',
                                          fontWeight: 'bold',
                                          px: 1,
                                          py: 0.2,
                                          borderRadius: '4px',
                                          flexShrink: 0,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        Default
                                      </Box>
                                    )}
                                  </Box>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>

                        {/* Add/Edit Button */}
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPaymentModal(true);
                          }}
                          sx={{
                            textTransform: 'none',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '13px',
                            px: 2.5,
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: colors.blue,
                            '&:hover': {
                              backgroundColor: colors['blue.3'],
                            },
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          Add/Edit
                        </Button>
                      </Box>
                    )}
                  </Box>

                  {/* Option 2: Pay This Bill Only (Do Not Save Payment Method) */}
                  {!isSchedule && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                      <FormControlLabel
                        value="no-save"
                        control={<Radio color="primary" sx={{ p: '9px', mt: '-2px' }} />}
                        label={
                          <Box sx={{ ml: 0.5, mt: -0.25 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#172D56' }}>
                              Pay This Bill Only (Do Not Save Payment Method)
                            </Typography>
                            <Typography sx={{ fontSize: '13px', color: '#7F8C8D', mt: 0.5 }}>
                              Enter payment details for this transaction only.
                            </Typography>
                          </Box>
                        }
                        sx={{
                          alignItems: 'flex-start',
                          m: 0,
                          mr: 0,
                        }}
                      />
                    </Box>
                  )}
                </RadioGroup>

                {/* Scenario B - Use a Saved Payment Method Actions */}
                {paymentType === 'saved' && (
                  paymentDetailsInfo?.company?.allow_payments == 0 ? (
                    <Box
                      className="instructions-html"
                      sx={{
                        mt: 2,
                        '& a': {
                          color: 'red !important',
                          textDecoration: 'none',
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: finalHTML }}
                    />
                  ) : paymentDetailsInfo?.customer?.is_payments_blocked == 1 ? (
                    <Typography variant="body2" mt={2} color="red" fontWeight="bold">
                      {paymentDetailsInfo?.block_individual_customer_pay_text ?? 'Payments are not allowed at this time.'}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 1 }}>
                      <Button
                        onClick={() => navigate(-1)}
                        variant="outlined"
                        sx={{ color: colors.blue, borderColor: colors.blue, px: 4, height: '41px', borderRadius: '8px' }}
                      >
                        Back
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
                          px: 4,
                          height: '41px',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          backgroundColor: colors.blue,
                          '&:hover': {
                            backgroundColor: colors['blue.3'],
                          },
                        }}
                      >
                        {isSchedule ? 'Schedule a Payment' : 'CONFIRM PAYMENT'}
                      </Button>
                    </Box>
                  )
                )}
              </Box>
            ) : (
              /* SCENARIO A: Customer Has NO Saved Payment Methods */
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={saveThisPaymentForFuture}
                      onChange={(e) => setSaveThisPaymentForFuture(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ color: 'text.primary', fontSize: '15px', fontWeight: 600 }}>
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
                    alignItems: 'flex-start',
                  }}
                />

                <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: '8px' }}>
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
                            <Question size={20} color="#5dade2" weight="fill" />
                            {hovered && (
                              <Box
                                component="img"
                                src={`${BASE_URL}/resources/front/images/bankaccount-help.png`}
                                alt="Help"
                                sx={{
                                  position: 'absolute',
                                  top: '30px',
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
              </Box>
            )}

            {/* If Option 2 (no-save in Scenario B), render debitType selector */}
            {hasSavedPaymentMethods && paymentType === 'no-save' && (
              <Box component={Paper} variant="outlined" sx={{ p: 2, mb: 2, mt: 2, borderRadius: '8px' }}>
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
                          <Question size={20} color="#5dade2" weight="fill" />
                          {hovered && (
                            <Box
                              component="img"
                              src={`${BASE_URL}/resources/front/images/bankaccount-help.png`}
                              alt="Help"
                              sx={{
                                position: 'absolute',
                                top: '30px',
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
          </Box>
        </form>

        {/* Payment Entry Iframe Container for Scenario A or Scenario B (one-time) */}
        {(!hasSavedPaymentMethods || paymentType === 'no-save') && (
          paymentDetailsInfo?.company?.allow_payments == 0 ? (
            <Box
              className="instructions-html"
              sx={{
                '& a': {
                  color: 'red !important',
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
              type={debitType === 'card' ? 'card' : 'account'}
              onSuccess={(data: CardDetails) => setCardBankDetails(data)}
              invoiceId={id}
              convenience_fee={String(watch('convenienceFee') || 0)}
              amount={(Number(watch('amount')) || 0).toFixed(2)}
              amountRequired={true}
            />
          )
        )}

        {/* Payment Methods Management Modal */}
        {openPaymentModal && (
          <Dialog
            open={openPaymentModal}
            scroll="paper"
            fullWidth
            maxWidth={false}
            PaperProps={{
              sx: {
                maxHeight: '90vh',
                width: Object.keys(myCard || {}).length ? '830px' : '800px',
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
                try {
                  setSelectedCardDetails(data);
                  setOpenConfirm(true);
                } catch {
                  console.error('Failed to parse card details');
                }
              }}
              autoPayDetails={(details) => {
                if (details && typeof details === 'object') {
                  setSelectedCardDetails(details as CardDetails);
                }
              }}
              paymentDetailsPage={true}
            />
          </Dialog>
        )}

        {/* Payment Summary Modal */}
        {(showPaymentSummary || cardBankDetails) && (
          <PaymentSummaryModal
            open={Boolean(showPaymentSummary || cardBankDetails)}
            onClose={() => {
              if (cardBankDetails) {
                setCardBankDetails(null);
              }
              if (showPaymentSummary) setShowPaymentSummary(false);
            }}
            onPay={() => {
              if (cardBankDetails) {
                const details = cardBankDetails;
                setCardBankDetails(null);
                handleSaveDetails(details, debitType);
              } else {
                handlePay();
              }
            }}
            payText={isSchedule ? 'Schedule Payment' : 'Pay Now'}
            amount={cardAmount ? Number(cardAmount) : Number(amount || cardAmount || 0)}
            fee={cardConvenienceFee ? Number(cardConvenienceFee) : Number(watch('convenienceFee') || 0)}
            cardType={
              cardConvenienceFee && cardAmount && cardTransId
                ? 'card'
                : cardBankDetails
                  ? cardBankDetails?.cardType ?? cardBankDetails?.ssl_card_short_description ?? (debitType === 'card' ? 'Credit Card' : 'Bank Account')
                  : selectedCardDetails?.card_type || selectedCardDetails?.account_type || 'Bank Account'
            }
            cardLast4={
              cardConvenienceFee && cardAmount && cardTransId
                ? maskValue(cardTransId)
                : cardBankDetails
                  ? cardBankDetails?.cardNumber ?? cardBankDetails?.ssl_card_number ?? cardBankDetails?.accountNumber ?? cardBankDetails?.last_4 ?? ''
                  : getCardLast4(selectedCardDetails)
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

        {/* Confirm Default Payment Dialog */}
        {openConfirm && (
          <ConfirmDialog
            open={openConfirm}
            title={'Default payment method?'}
            message={`Do you want to save this as your default payment method?`}
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

        {/* Recurring Acknowledge Dialog */}
        {recurringAckownledgeModal && (
          <ConfirmDialog
            open={recurringAckownledgeModal}
            title={'Customer Acknowledgement'}
            message={customer_acknowledgement_text}
            confirmLabel="Ok"
            cancelLabel="Cancel"
            onConfirm={onCustomerAckowledge}
            onCancel={() => {
              setRecurringAckownledgeModal(false);
            }}
            loader={accountLoading}
            checkBox={true}
          />
        )}

        {isFeeLoading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 1200,
              backgroundColor: 'transparent',
              cursor: 'not-allowed',
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
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
