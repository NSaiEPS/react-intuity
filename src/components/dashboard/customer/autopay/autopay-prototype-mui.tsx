import * as React from 'react';
import { useState, useMemo, useLayoutEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
// import ErrorIcon from '@mui/icons-material/Error';
import { WarningCircle } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import { Button } from 'nsaicomponents';
import { toast } from '@/lib/custom-toast';

import {
  CreditCard,
  Bank,
  Check,
  X,
  CaretDown,
  Trash,
  Plus,
  ArrowLeft,
  ArrowBendDownRight,
  ShieldCheck,
  Warning,
  CheckCircle,
  XCircle,
  Info,
  Question,
  CurrencyDollar,
} from '@phosphor-icons/react';

/* ------------------------------------------------------------------ *
 *  Real payment-capture modals (already wired to your APIs)
 *  Adjust these import paths to match where they live in your app.
 * ------------------------------------------------------------------ */
import AddBankAccountModal from '../add-bank-modal';
import AddCardModal from '../add-card-modal';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from '@/hooks/redux';
import { RootState, store } from '@/state/store';
import { getLocalStorage, IntuityUser, updateLocalStorageValue } from '@/utils/auth';
import { paths } from '@/utils/paths';
import { getPaymentProcessorDetails, getConvenienceFee, getPaymentDetails, updatePaperLessInfo } from '@/state/features/accountSlice';
import { boarderRadius, colors, CustomerInfo } from '@/utils';
import dayjs, { Dayjs } from 'dayjs';
import { tooltipSx } from '@/utils/config';
import { PaymentMethods } from '../payment-methods';
import { getCardLast4, renderCardBrand } from '../../account/payment-details';
import Header from '@/components/CommonComponents/header-common';
import { formatCurrency } from '@/utils/formatters';
import { useLoading } from '@/components/core/skeleton-context';
import { AutoPaySkeleton } from '@/components/dashboard/skeletons';
import { getDashboardInfo } from '@/state/features/dashBoardSlice';

/* ------------------------------------------------------------------ *
 *  Types
 * ------------------------------------------------------------------ */
type MethodType = 'card' | 'bank';

interface PaymentMethod {
  id: string | number;
  type: MethodType;
  brand: string;
  last4: string;
  isDefault: boolean;

  company_id: number;
  user_id: number;

  card_token: string;
  card_type: string;
  card_number: string;

  date_used: string;

  expired: number;
  is_icheck_card: number;
  is_elavon_card: number;

  bank_account_number: string | null;
  routing_number: string | null;
  account_type: string | null;

  is_bank_account: number;
  is_worldpay_card: number;

  expiration_month: string;
  expiration_year: string;

  is_nacha_ach: number;
  is_achworks_ach: number;

  status: number;
  nacha_ppd_auth: number;

  deleted_at: string | null;

  is_elavon_ach: number;
  elavon_company_name: string | null;

  approval_code: string | null;
  token_id: string | null;

  is_verified: number | null;

  date_time_add: string | null;
  return_code_verification: string | null;
  effective_date: string | null;
  settlement_date: string | null;

  days_diff: number;
}

type ViewName = 'dashboard' | 'enroll-choose' | 'review' | 'deactivate';

interface CardInfo {
  card_type?: string;
  account_type?: string;
  card_number?: string;
  bank_account_number?: string;
  date_used?: string | number | Date | Dayjs;
  [key: string]: unknown;
}

interface CardDetails {
  card?: CardInfo;
  token?: string;
  date_used?: string | number | Date | Dayjs;
  account_type?: string;
  card_number?: string;
  bank_account_number?: string;
  card_type?: string;
  card_token?: string;
  id?: string | number;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ *
 *  Palette
 *  Swap these for your own `colors` import from '@/utils' if you'd
 *  rather stay on the shared design tokens.
 * ------------------------------------------------------------------ */
const palette = {
  navy: '#2E6696',
  blue: '#1868A8',
  blueLight: '#EAF3FB',
  blueLine: '#CFE2F3',
  green: '#1E8E5A',
  greenLight: '#E8F7EF',
  red: '#C1401F',
  redLight: '#FBEBE6',
  ink: '#16232E',
  gray: '#5B6B7A',
  grayLight: '#8996A3',
  line: '#DCE3EA',
  canvas: '#F4F7FA',
};

// const ACCOUNT = {
//   accountNo: '20110',
//   amountDue: 818.12,
//   dueDate: '08/15/2026',
// };

const fmt = (n: number): string =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const uid = (): string => Math.random().toString(36).slice(2, 9);

/* ------------------------------------------------------------------ *
 *  Small building blocks
 * ------------------------------------------------------------------ */

function AccountBanner({
  accountNo,
  amountDue,
  dueDate,
}: {
  accountNo: string;
  amountDue: string;
  dueDate: string;
}) {

  const rows: Array<[string, string]> = [
    ['Account No.', accountNo],
    ['Bill Amount Due', `${formatCurrency(amountDue)}`],
    ['Due Date', dueDate],
  ];
  return (
    <Box
      sx={{
        backgroundColor: '#EAF6FF',
        boxShadow: '0 4px 14px rgba(23, 45, 86, 0.16)',
        borderRadius: 1,
        p: { xs: 2, sm: 3 },
        mb: 2,
      }}
    >
      {rows.map(([label, val]) => (
        <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 0.3 }}>
          <Typography fontWeight={500} color="black">
            {label}
          </Typography>
          <Typography fontWeight={500} color="black" sx={{ textAlign: 'right' }}>
            {val}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}

function StepRail({ step }: { step: 1 | 2 }) {
  const stepSx = (active: boolean, done: boolean) => ({
    width: 22,
    height: 22,
    fontSize: 12,
    fontWeight: 700,
    bgcolor: done ? palette.green : '#fff',
    color: done ? '#fff' : active ? palette.blue : palette.grayLight,
    border: `2px solid ${done ? palette.green : active ? palette.blue : palette.line}`,
  });
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar sx={stepSx(step === 1, step > 1)}>{step > 1 ? <Check size={12} weight="bold" /> : '1'}</Avatar>
        <Typography variant="caption" sx={{ fontWeight: 700, color: step === 1 ? palette.navy : step > 1 ? palette.green : palette.grayLight }}>
          Choose payment
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, height: 2, bgcolor: step > 1 ? palette.green : palette.line }} />
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar sx={stepSx(step === 2, false)}>2</Avatar>
        <Typography variant="caption" sx={{ fontWeight: 700, color: step === 2 ? palette.navy : palette.grayLight }}>
          Review &amp; confirm
        </Typography>
      </Stack>
    </Stack>
  );
}

function MethodIcon({ type }: { type: MethodType }) {
  return (
    <Avatar variant="rounded" sx={{ width: 34, height: 26, bgcolor: palette.canvas, border: `1px solid ${palette.line}` }}>
      {type === 'card' ? <CreditCard size={16} color={palette.navy} /> : <Bank size={16} color={palette.navy} />}
    </Avatar>
  );
}

function methodLabel(method: PaymentMethod): string {
  return method.type === 'card'
    ? `${method.card_type} ending in ${method.last4}`
    : `${method.brand}${method.last4 ? ' ••• ' + method.last4 : ''}`;
}

function DefaultChip({ isDefault }: { isDefault: boolean }) {
  return (
    <Chip
      label={isDefault ? 'Default' : 'Not default'}
      size="small"
      sx={{
        fontWeight: 700,
        bgcolor: isDefault ? palette.greenLight : palette.canvas,
        color: isDefault ? palette.green : palette.gray,
      }}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Payment method row (used in Review & Confirm)
 * ------------------------------------------------------------------ */
function PaymentMethodSelector({
  methods,
  selectedId,
  onSelect,
  onOpenManage,
  autopayMethodInfo,
}: {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenManage: () => void;
  autopayMethodInfo?: CardDetails;
}) {
  return (
    <Box sx={{
      // border: '1.5px solid #2A72B9',
      borderRadius: '16px',
      // py: 2,
      mb: 3,
      backgroundColor: '#ffffff',
    }}>
      <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: '#172D56', mb: 2 }}>
        Payment Method
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>

        {/* Saved payment details box */}
        {
          (autopayMethodInfo?.id || (autopayMethodInfo as any)?.card_token || (autopayMethodInfo as any)?.last4) && (
            <Box
              // onClick={() => {
              //   setPaymentType('saved');
              // }}
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
              {renderCardBrand(autopayMethodInfo?.card_type ?? autopayMethodInfo?.account_type ?? (autopayMethodInfo as any)?.brand)}

              <Typography sx={{ fontSize: '14px', color: '#2C3E50', fontWeight: 500 }}>
                {autopayMethodInfo?.card_type || autopayMethodInfo?.account_type || (autopayMethodInfo as any)?.brand || 'Card'} ending in{' '}
                {getCardLast4(autopayMethodInfo as any) || (autopayMethodInfo as any)?.last4 || ''}
              </Typography>

              {/* Default Badge */}
              <Box
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
            </Box>
          )
        }
        {/* Add/Edit Button */}
        <Button
          variant="contained"
          size="small"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors['blue.3']}
          hoverColor="white"
          style={{
            fontWeight: 500,
            fontSize: '13px',
            padding: '4px 16px',
            borderRadius: '4px',
            marginLeft: '8px',
          }}
          onClick={(e: any) => {
            e.stopPropagation();
            onOpenManage();
          }}
        >
          Add/Remove
        </Button>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ *
 *  Make-default confirmation modal
 * ------------------------------------------------------------------ */
function MakeDefaultModal({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <Dialog open onClose={onNo} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        <Avatar sx={{ bgcolor: palette.blueLight, width: 48, height: 48, mx: 'auto', mb: 2 }}>
          <Info size={24} color={palette.blue} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 800, color: palette.navy, mb: 1 }}>
          Make This Your Default Payment Method?
        </Typography>
        <Typography variant="body2" sx={{ color: palette.gray, mb: 3 }}>
          You already have a default payment method on file. Would you like to replace it with the one you just
          added?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" fullWidth onClick={onNo}>
          No
        </Button>
        <Button variant="contained" fullWidth onClick={onYes}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ *
 *  Success / Deactivated modals
 * ------------------------------------------------------------------ */
function SuccessModal({ onDone }: { onDone: () => void }) {
  return (
    <Dialog open onClose={onDone} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        <CheckCircle size={56} color={palette.green} weight="fill" style={{ marginBottom: 10 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
          You're all set!
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
          You've successfully enrolled in AutoPay. <span style={{ fontWeight: 500, display: "block", marginTop: "5px" }}>Your payment will be automatically processed on the due date shown on your utility portal.</span>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="contained" fullWidth onClick={onDone}
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors['blue.3']}
          hoverColor="white"
          style={{
            borderRadius: '12px',
            height: '41px',
          }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeactivatedModal({ onOk }: { onOk: () => void }) {
  return (
    <Dialog open onClose={onOk} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        <CheckCircle size={56} color={palette.green} weight="fill" style={{ marginBottom: 10 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          AutoPay Deactivated
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button fullWidth onClick={onOk}
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors['blue.3']}
          hoverColor="white"
          style={{
            borderRadius: '12px',
            height: '41px',
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ *
 *  Review & Confirm screen
 * ------------------------------------------------------------------ */
function ReviewConfirm({
  methods,
  autopayMethodId,
  setAutopayMethodId,
  authChecked,
  setAuthChecked,
  onBack,
  onEnroll,
  handleEnrollSave,
  onRemove,
  onSetDefault,
  onAddNew,
  accountNo,
  amountDue,
  dueDate,
  userInfo,
  isAutoPay,
  setisAutoPay,
  accountLoading,
  autopayMethodInfo,
  setAutopayMethodInfo,
  openPaymentModal,
  setOpenPaymentModal,
}: {
  methods: PaymentMethod[];
  autopayMethodId: string;
  setAutopayMethodId: (id: string) => void;
  authChecked: boolean;
  setAuthChecked: (checked: boolean) => void;
  onBack: () => void;
  onEnroll: () => void;
  handleEnrollSave: () => void;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
  onAddNew: (method: PaymentMethod) => void;
  accountNo: string;
  amountDue: string;
  dueDate: string;
  userInfo: CustomerInfo;
  setisAutoPay: React.Dispatch<React.SetStateAction<boolean>>;
  isAutoPay: boolean;
  accountLoading: boolean;
  autopayMethodInfo: CardDetails | null;
  setAutopayMethodInfo: React.Dispatch<React.SetStateAction<CardDetails | null>>;
  openPaymentModal: boolean;
  setOpenPaymentModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { company: companyParam } = useParams<{ company?: string }>();
  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);
  const paymentDetailsInfo = useSelector((state: RootState) => state?.Account?.paymentDetailsInfo);

  const companyName = React.useMemo(() => {
    const companyDetails = getLocalStorage('intuity-company') as any;
    const aliasDetails = getLocalStorage('alias-details') as any;
    return (
      dashBoardInfo?.body?.company?.company_name ||
      companyDetails?.company_name ||
      aliasDetails?.company_name ||
      paymentDetailsInfo?.company?.company_name ||
      companyParam ||
      'Company'
    );
  }, [dashBoardInfo, paymentDetailsInfo, companyParam]);
  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <ShieldCheck size={20} color={palette.navy} />
        <Typography sx={{
          color: '#2F66B3',
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          lineHeight: 1,
        }}>
          Review &amp; Confirm
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: palette.gray, mb: 2.5 }}>
        Confirm the payment method you'd like to use for AutoPay.
      </Typography>

      <Card variant="outlined" sx={{ p: 1, borderRadius: 0, border: "none" }}>
        <AccountBanner accountNo={accountNo} amountDue={amountDue} dueDate={dueDate} />
        <StepRail step={2} />
        <PaymentMethodSelector
          methods={methods}
          selectedId={autopayMethodId}
          onSelect={setAutopayMethodId}
          autopayMethodInfo={autopayMethodInfo}
          onOpenManage={() => setOpenPaymentModal(true)}
        />

        <Card variant='outlined' sx={{ py: 1.75, my: 2.25, mx: 0, border: "none" }}>
          <FormControlLabel
            sx={{ alignItems: 'flex-start', mx: 0 }}
            control={
              <Checkbox
                checked={authChecked}
                onChange={(e) => setAuthChecked(e.target.checked)}

              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.55 }}>
                I authorize {companyName} to automatically charge my selected payment method for the total amount
                due for my utility account each billing period. Payment will be processed on the due date displayed
                on my utility portal. This authorization will remain in effect until I cancel my AutoPay enrollment.
              </Typography>
            }
          />
        </Card>

        <Stack direction="row" spacing={1.5} justifyContent="space-between">
          <Button variant="outlined"
            textTransform="capitalize"
            style={{
              color: colors.blue,
              borderColor: colors.blue,
              backgroundColor: "white",
              borderRadius: '12px',
              padding: "0 24px",
              height: '41px',
            }}
            onClick={() => {
              setisAutoPay(userInfo?.autopay === 1);
              onBack()
            }}>
            <ArrowLeft size={16} style={{ marginRight: 2 }} />  Back
          </Button>
          <Button
            disabled={
              !authChecked ||
              accountLoading ||
              !autopayMethodInfo
            }
            loading={accountLoading}
            onClick={handleEnrollSave}
            variant="contained"
            textTransform="none"
            bgColor={colors.blue}
            hoverBackgroundColor={colors['blue.3']}
            hoverColor="white"
            style={{
              borderRadius: '12px',
              height: '41px',
              padding: "0 24px",
              width: "fit-content"
            }}
          >
            Enroll in AutoPay
          </Button>
        </Stack>
      </Card>


    </Box>
  );
}

/* ------------------------------------------------------------------ *
 *  Enrollment "choose payment method" screen (Scenarios 1-3, step 1)
 * ------------------------------------------------------------------ */
function EnrollChoose({
  methods,
  setOpenPaymentModal,
  setCardModalOpen,
  setBankModalOpen,
  paymentType,
  setPaymentType,
  autopayMethodInfo,
  newCardSelected,
  onContinueExisting,
  onNewMethodContinue,
  onCancel,
  accountNo,
  amountDue,
  dueDate,
}: {
  methods: PaymentMethod[];
  setOpenPaymentModal: (value: boolean) => void;
  setCardModalOpen: (value: boolean) => void;
  setBankModalOpen: (value: boolean) => void;
  setPaymentType: (type: 'saved' | 'no-save' | '') => void;
  paymentType: 'saved' | 'no-save' | '';
  autopayMethodInfo: CardDetails;
  newCardSelected: boolean;
  onContinueExisting: (id: string) => void;
  onNewMethodContinue: (method: PaymentMethod) => void;
  onCancel: () => void;
  accountNo: string;
  amountDue: string;
  dueDate: string;
}) {
  const hasSaved = methods.length > 0;
  const defaultMethod = methods.find((m) => m.isDefault) || methods[0];

  const [pickedExistingId, setPickedExistingId] = useState<string | number>(
    defaultMethod ? defaultMethod.id : null
  );

  const hasSavedCard = Boolean(
    autopayMethodInfo?.id ||
    autopayMethodInfo?.card_token ||
    autopayMethodInfo?.token ||
    autopayMethodInfo?.card_number ||
    autopayMethodInfo?.bank_account_number ||
    autopayMethodInfo?.account_type ||
    autopayMethodInfo?.card_type ||
    (methods && methods.length > 0)
  );

  const displayCard = (
    autopayMethodInfo?.id ||
    autopayMethodInfo?.card_token ||
    autopayMethodInfo?.token ||
    autopayMethodInfo?.card_number ||
    autopayMethodInfo?.bank_account_number ||
    autopayMethodInfo?.account_type ||
    autopayMethodInfo?.card_type
  ) ? autopayMethodInfo : defaultMethod;

  React.useEffect(() => {
    if (hasSavedCard && (paymentType === '' || !newCardSelected)) {
      setPaymentType('saved');
    } else if (!hasSavedCard && paymentType !== 'no-save') {
      setPaymentType('no-save');
    }
  }, [hasSavedCard, newCardSelected]);

  const canContinue =
    paymentType === 'saved'
      ? hasSavedCard
      : paymentType === 'no-save'
        ? newCardSelected || hasSavedCard
        : false;

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        {/* <Typography sx={{ fontSize: 20 }}>$</Typography> */}
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
        <Typography sx={{
          color: '#2F66B3',
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          lineHeight: 1,
        }}>
          Enroll in AutoPay
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: palette.gray, mb: 2.5 }}>
        Choose a payment method for AutoPay. AutoPay must be enabled 24 hours prior to your invoice's autopay
        collection date to ensure processing.
      </Typography>

      <Box sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
        <AccountBanner accountNo={accountNo} amountDue={amountDue} dueDate={dueDate} />
        <StepRail step={1} />
      </Box>
      < Box
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
            setPaymentType(val);
          }}
        >
          {/* Option 1: Saved Payment Method - Only rendered if saved card exists */}
          {hasSavedCard && (
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
                {renderCardBrand(displayCard?.card_type ?? displayCard?.account_type ?? (displayCard as any)?.brand)}

                <Typography sx={{ fontSize: '14px', color: '#2C3E50', fontWeight: 500 }}>
                  {displayCard?.card_type || displayCard?.account_type || (displayCard as any)?.brand || 'Card'} ending in{' '}
                  {getCardLast4(displayCard as any) || (displayCard as any)?.last4 || ''}
                </Typography>

                {/* Default Badge */}
                <Box
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
              </Box>

              {/* Add/Remove Button */}
              <Button
                variant="contained"
                size="small"
                textTransform="none"
                bgColor={colors.blue}
                hoverBackgroundColor={colors['blue.3']}
                hoverColor="white"
                style={{
                  fontWeight: 500,
                  fontSize: '13px',
                  padding: '4px 16px',
                  borderRadius: '4px',
                  marginLeft: '8px',
                }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  setOpenPaymentModal(true);
                }}
              >
                Add/Remove
              </Button>
            </Box>
          )}

          {/* Option 2: Pay this bill only */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <FormControlLabel
              value="no-save"
              control={<Radio color="primary" />}
              label={
                <Box sx={{ ml: 0.5, mt: -0.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '15px' }}>
                      Add a new payment method
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Box>
        </RadioGroup>

        {paymentType === "no-save" && (
          <Box
            sx={{ px: 4 }}>
            <RadioGroup
              row
            // value={debitType}
            // onChange={(e) => setDebitType(e.target.value as 'card' | 'bank_account')}
            >
              <FormControlLabel value="card" control={<Radio />} label="Credit Card" onClick={() => setCardModalOpen(true)} />
              <FormControlLabel
                value="bank_account"
                control={<Radio />}
                label="Bank Account"
                onClick={() => setBankModalOpen(true)}
              />
            </RadioGroup>
          </Box>
        )}
      </Box >

      <Stack direction="row" spacing={1.5} justifyContent={"space-between"} sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          // fullWidth
          textTransform="none"
          onClick={onCancel}
          style={{
            color: colors.blue,
            borderColor: colors.blue,
            backgroundColor: "white",
            borderRadius: '12px',
            padding: "0 24px",
            height: '41px',
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors['blue.3']}
          hoverColor="white"
          // fullWidth
          style={{
            borderRadius: '12px',
            height: '41px',
            padding: "0 24px",
          }}
          disabled={!canContinue}
          onClick={() => onContinueExisting(String(displayCard?.id ?? pickedExistingId ?? ''))}
        >
          Continue
        </Button>
      </Stack>
    </Box >
  );
}

/* ------------------------------------------------------------------ *
 *  Deactivate AutoPay screen
 * ------------------------------------------------------------------ */
function DeactivatePage({
  method,
  onKeep,
  onDeactivate,
  accountNo,
  accountLoading,
  amountDue,
  dueDate,
}: {
  method: CardDetails | PaymentMethod | null;
  onKeep: () => void;
  onDeactivate: () => void;
  accountLoading: boolean;
  accountNo: string;
  amountDue: string;
  dueDate: string;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <WarningCircle size={32} color="#F18609" weight="fill" />
        <Typography variant="h6" sx={{ fontWeight: 800, color: palette.navy, fontSize: "1.5rem" }}>
          Deactivate AutoPay?
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: palette.gray }}>
        You are about to deactivate AutoPay for the account below.
      </Typography>

      <Card variant="outlined" sx={{ py: 2.5, borderColor: palette.line, border: "none" }}>
        <Box sx={{
          backgroundColor: '#EAF6FF',
          boxShadow: '0 4px 14px rgba(23, 45, 86, 0.16)',
          borderRadius: 1,
          p: { xs: 2, sm: 3 },
          mb: 2,
        }}>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 0.3 }}>
            <Typography variant="body2" sx={{ color: palette.navy, fontWeight: 600 }}>
              Account Number
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {accountNo}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.3 }}>
            <Typography variant="body2" sx={{ color: palette.navy, fontWeight: 600 }}>
              Payment Method
            </Typography>
            {/* <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {methodLabel(method)}
              {renderCardBrand(method?.card_type ?? method?.account_type)}
            </Typography> */}
            <Box
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
              {renderCardBrand(method?.card_type ?? method?.account_type)}

              <Typography sx={{ fontSize: '14px', color: '#2C3E50', fontWeight: 500 }}>
                {method?.card_type || method?.account_type || 'Card'} ending in{' '}
                {getCardLast4(method as any)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Typography variant="overline" sx={{ color: palette.gray, fontWeight: 800, display: 'block', mb: 1.25 }}>
          After deactivation:
        </Typography>
        <Stack direction="row" spacing={1.25} sx={{ mb: 1.25 }}>
          <Info size={16} color={palette.navy} style={{ flexShrink: 0, marginTop: 2 }} />
          <Typography variant="body2">Future payments will no longer be made automatically.</Typography>
        </Stack>
        <Stack direction="row" spacing={1.25} sx={{ mb: 2 }}>
          <Info size={16} color={palette.navy} style={{ flexShrink: 0, marginTop: 2 }} />
          <Typography variant="body2">You will be responsible for making payments by the due date.</Typography>
        </Stack>

        <FormControlLabel
          sx={{ alignItems: 'flex-start', mb: 1, mx: 0 }}
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
          label={
            <Typography variant="body2">
              I understand that AutoPay will be deactivated and I will need to make payments manually.
            </Typography>
          }
        />

        <Stack direction="row" spacing={1.5} justifyContent="space-between" sx={{ mt: 1.5 }}>
          <Button variant="outlined" onClick={onKeep}
            textTransform="capitalize"

            style={{
              color: colors.blue,
              borderColor: colors.blue,
              backgroundColor: "white",
              borderRadius: '12px',
              padding: "0 24px",
              height: '41px',
            }}>
            Keep AutoPay
          </Button>
          <Button
            variant="contained"
            style={{
              backgroundColor: palette.red,
              borderRadius: '12px',
              padding: "0 24px",
              height: '41px',
            }}
            textTransform="none"
            hoverBackgroundColor={'white'}
            hoverColor="white"
            loading={accountLoading}
            disabled={!checked} onClick={onDeactivate}>
            Deactivate AutoPay

          </Button>
        </Stack>
      </Card>
    </Box>
  );
}

/* ------------------------------------------------------------------ *
 *  Dashboard
 * ------------------------------------------------------------------ */
function Dashboard({
  autopayEnabled,
  autopayMethodInfo,
  pendingMethodInfo,
  onToggle,
  onChangeMethod,
  onDeactivate,
  onSetUp,
  onSave,
  onCancel,
  hasPendingChanges,
  accountLoading,
  accountNo,
  name,
}: {
  autopayEnabled: boolean;
  autopayMethodInfo: CardDetails | PaymentMethod | null;
  pendingMethodInfo?: CardDetails | PaymentMethod | null;
  onToggle: () => void;
  onChangeMethod: () => void;
  onDeactivate: () => void;
  onSetUp: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  hasPendingChanges?: boolean;
  accountLoading?: boolean;
  accountNo: string;
  name: string;
}) {
  const navigate = useNavigate();
  const displayMethodInfo = pendingMethodInfo || autopayMethodInfo;
  const handleCancelClick = onCancel ?? (() => navigate(paths.dashboard.overview()));

  return (
    <Box sx={{ maxWidth: "100%", mx: 'auto' }}>
      <Card variant="outlined" sx={{ borderColor: palette.line, borderRadius: boarderRadius.card, width: "100%" }}>
        {/* Header with Account No & Name */}
        {/* <Grid container spacing={2} justifyContent="space-between" alignItems="center" sx={{ px: 1, py: 0.5 }}> */}
        {/* <CardHeader
            title={<Typography variant="h5" fontWeight={700}>Manage AutoPay</Typography>}
          />

          <CardHeader
            subheader={
              <Typography  ml={1} variant="h6" textAlign="left">
                Name: {name}
              </Typography>
            }
            title={
              <Typography  ml={1} variant="h6" textAlign="left">
                Account No: {accountNo}
              </Typography>
            }
          /> */}
        <Header title="Manage AutoPay" />
        {/* </Grid> */}

        <Divider />

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          {autopayEnabled ? (
            /* ==================== AUTOPAY IS ON ==================== */
            <Box>
              {/* Status Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 3 }}>
                <CheckCircle size={32} color="#1E8E5A" weight="fill" style={{ flexShrink: 0, marginTop: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E8E5A', fontSize: '1.25rem', lineHeight: 1.2 }}>
                    AutoPay is active
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#5B6B7A', mt: 0.5 }}>
                    Your payments are set to be paid automatically.
                  </Typography>
                </Box>
              </Box>

              {/* Payment Method Section */}
              <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#16232E', mb: 1.5 }}>
                  Payment Method
                </Typography>

                {displayMethodInfo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: hasPendingChanges ? '1.5px solid #1868A8' : '1px solid #D6DBDF',
                        borderRadius: '8px',
                        px: 2,
                        py: 1,
                        backgroundColor: '#ffffff',
                        gap: 1.5,
                      }}
                    >
                      {renderCardBrand(displayMethodInfo?.card_type ?? displayMethodInfo?.account_type)}
                      <Typography sx={{ fontSize: '14px', color: '#2C3E50', fontWeight: 600 }}>
                        {displayMethodInfo?.card_type || displayMethodInfo?.account_type || 'Card'} ending in{' '}
                        {getCardLast4(displayMethodInfo as any)}
                      </Typography>
                      {hasPendingChanges && (
                        <Chip
                          label="Pending Save"
                          size="small"
                          sx={{
                            bgcolor: '#EAF3FB',
                            color: '#1868A8',
                            fontWeight: 700,
                            fontSize: '11px',
                            height: '22px',
                          }}
                        />
                      )}
                    </Box>

                    {/* Add/Remove Button */}
                    <Button
                      variant="contained"
                      size="small"
                      textTransform="none"
                      bgColor={colors.blue}
                      hoverBackgroundColor={colors['blue.3']}
                      hoverColor="white"
                      style={{
                        fontWeight: 500,
                        fontSize: '13px',
                        padding: '4px 16px',
                        borderRadius: '4px',
                        marginLeft: '8px',
                      }}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onChangeMethod();
                      }}
                    >
                      Add/Remove
                    </Button>
                  </Box>
                )}
              </Box>

              {/* AutoPay Settings Section */}
              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#16232E', mb: 0.5 }}>
                  AutoPay Settings
                </Typography>
                <Typography variant="body2" sx={{ color: '#5B6B7A', mb: 1 }}>
                  Need to stop automatic payments?
                </Typography>

                <Typography
                  onClick={onDeactivate}
                  sx={{
                    color: colors.blue,
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    display: 'inline-block',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: colors['blue.1'],
                    },
                  }}
                >
                  Deactivate AutoPay
                </Typography>
              </Box>
            </Box>
          ) : (
            /* ==================== AUTOPAY IS OFF ==================== */
            <Box>
              {/* Status Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                <XCircle size={32} color="#C1401F" weight="fill" style={{ flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#C1401F', fontSize: '1.25rem', mt: 0.4 }}>
                    AutoPay is off.
                  </Typography>

                </Box>
              </Box>

              <Box>
                <Typography variant="body1" sx={{ color: '#5B6B7A', }}>
                  Your payments will not be made automatically.
                </Typography>
                <Typography variant="body1" sx={{ color: '#5B6B7A', }}>
                  Set up AutoPay to have future bills paid.
                </Typography>
              </Box>

              {/* Set Up AutoPay Action Link */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography
                  onClick={onSetUp}
                  sx={{
                    color: colors.blue,
                    fontWeight: 700,
                    fontSize: '15px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    display: 'inline-block',
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: colors['blue.1'],
                    },
                  }}
                >
                  Set Up AutoPay
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Divider />

        {/* Footer Actions */}
        <CardActions sx={{ p: 2.5, justifyContent: 'flex-start', gap: 2 }}>
          <Button
            variant="outlined"
            textTransform="capitalize"
            onClick={handleCancelClick}
            style={{
              color: colors.blue,
              borderColor: colors.blue,
              backgroundColor: 'white',
              borderRadius: '12px',
              height: '41px',
              padding: '0 24px',
            }}
          >
            Cancel
          </Button>

          {autopayEnabled && onSave && (
            <Button
              variant="contained"
              textTransform="none"
              disabled={!hasPendingChanges || accountLoading}
              loading={accountLoading}
              onClick={onSave}
              bgColor={colors.blue}
              hoverBackgroundColor={colors['blue.3']}
              hoverColor="white"
              style={{
                borderRadius: '12px',
                height: '41px',
                padding: '0 24px',
              }}
            >
              Save
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  );
}

export default function AutoPayPrototype() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { contextLoading, setContextLoading } = useLoading();

  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);
  // const userInfo: IntuityUser = getLocalStorage('intuity-customerInfo') as IntuityUser;
  const paymentDetailsInfo = useSelector((state: RootState) => state?.Account?.paymentDetailsInfo);
  const paymentMethodInfo = useSelector((state: RootState) => state?.Account?.paymentMethodInfo);

  const userInfo: CustomerInfo = getLocalStorage('intuity-customerInfo') as CustomerInfo;
  const raw = getLocalStorage('intuity-user');
  const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;

  const isInitialAutopayOn = () => {
    const apiVal = dashBoardInfo?.body?.customer?.autopay;
    if (apiVal !== undefined && apiVal !== null) {
      return Number(apiVal) === 1;
    }
    const cust = getLocalStorage('intuity-customerInfo') as any;
    return Number(cust?.autopay) === 1;
  };

  // const CustomerInfo: CustomerInfo | null = dashBoardInfo?.body?.customer
  //   ? (dashBoardInfo?.body?.customer as unknown as CustomerInfo)
  //   : (getLocalStorage('intuity-customerInfo') as CustomerInfo | null);

  const myCustomerDetails = stored?.body as any;
  const billAmountDueValue =
    paymentDetailsInfo?.customer?.balance ?? myCustomerDetails?.balance ?? userInfo?.balance ?? 0;
  const billAmountDueNumber = Number(String(billAmountDueValue).replace(/[^0-9.-]/g, ''));
  const billAmountDue = Number.isFinite(billAmountDueNumber) ? `${formatCurrency(billAmountDueNumber)}` : '$0.00';

  const customerInfoDetails = userInfo as any;
  const billDueDate =
    paymentDetailsInfo?.customer?.last_bill?.due_date ??
    customerInfoDetails?.last_bill?.due_date ??
    (dashBoardInfo?.body?.customer as any)?.last_bill?.due_date;
  const formattedBillDueDate =
    billDueDate && dayjs(billDueDate).isValid() ? dayjs(billDueDate).format('MM/DD/YYYY') : billDueDate ?? 'MM/DD/YYYY';

  const accountNumber =
    customerInfoDetails?.acctnum ??
    customerInfoDetails?.account_number ??
    paymentDetailsInfo?.customer?.acctnum ??
    paymentDetailsInfo?.customer?.account_number ??
    '-';

  const customerName =
    customerInfoDetails?.customer_name ??
    customerInfoDetails?.name ??
    paymentDetailsInfo?.customer?.customer_name ??
    (dashBoardInfo?.body?.customer as any)?.customer_name ??
    '-';

  React.useEffect(() => {
    if (userInfo?.company_id) {
      const formdata = new FormData();
      formdata.append('acl_role_id', stored?.body?.acl_role_id || '');
      formdata.append('company_id', userInfo?.company_id);
      dispatch(getPaymentProcessorDetails(formdata, false));

      const convenienceFeeFormdata = new FormData();
      convenienceFeeFormdata.append('acl_role_id', stored?.body?.acl_role_id || '');
      convenienceFeeFormdata.append('customer_id', stored?.body?.customer_id || '');
      // dispatch(getConvenienceFee(convenienceFeeFormdata));

      const paymentDetailsFormdata = new FormData();
      paymentDetailsFormdata.append('acl_role_id', stored?.body?.acl_role_id || '');
      paymentDetailsFormdata.append('customer_id', stored?.body?.customer_id || '');
      dispatch(getPaymentDetails(paymentDetailsFormdata));
    }
  }, [userInfo, stored, dispatch]);

  // seed data toggles — flip these to try different starting scenarios
  const [methods, setMethods] = useState<PaymentMethod[]>([
    // {
    //   id: 6700,
    //   company_id: 2,
    //   user_id: 469,
    //   card_token: "6a7eab3df8f94411a0f41a062abddbf9",
    //   card_type: "Visa",
    //   card_number: "************1111",
    //   date_used: "2025-10-10 06:33:04",
    //   expired: 0,
    //   is_icheck_card: 1,
    //   is_elavon_card: 0,
    //   bank_account_number: null,
    //   routing_number: null,
    //   account_type: null,
    //   is_bank_account: 0,
    //   is_worldpay_card: 0,
    //   expiration_month: "11",
    //   expiration_year: "34",
    //   is_nacha_ach: 0,
    //   is_achworks_ach: 0,
    //   status: 1,
    //   nacha_ppd_auth: 0,
    //   deleted_at: null,
    //   is_elavon_ach: 0,
    //   elavon_company_name: null,
    //   approval_code: null,
    //   token_id: null,
    //   is_verified: null,
    //   date_time_add: null,
    //   return_code_verification: null,
    //   effective_date: null,
    //   settlement_date: null,
    //   days_diff: 0,
    //   type: 'card',
    //   brand: '',
    //   last4: '',
    //   isDefault: false
    // }
    // start with ZERO saved methods to exercise Scenario 1.
    // Try seeding one method below to exercise Scenarios 2 & 3 instead:
    // { id: "seed1", type: "card", brand: "Visa", last4: "1111", isDefault: true },
  ]);
  const [paymentType, setPaymentType] = useState<'saved' | 'no-save' | ''>('');
  const [autopayEnabled, setAutopayEnabled] = useState(() => isInitialAutopayOn());
  const [everEnrolled, setEverEnrolled] = useState(false);
  const [autopayMethodInfo, setAutopayMethodInfo] = useState(dashBoardInfo?.body?.autopay_card || null)
  const [autopayMethodId, setAutopayMethodId] = useState<string | number | null>(dashBoardInfo?.body?.autopay_card?.id || null);
  const [pendingMethodInfo, setPendingMethodInfo] = useState<CardDetails | PaymentMethod | null>(null);
  const [pendingMethodId, setPendingMethodId] = useState<string | number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const hasPendingChanges = useMemo(() => {
    if (!pendingMethodInfo) return false;
    const currentToken = autopayMethodInfo?.card_token || (autopayMethodInfo as any)?.token || autopayMethodInfo?.id;
    const pendingToken = pendingMethodInfo?.card_token || (pendingMethodInfo as any)?.token || pendingMethodInfo?.id;
    return pendingToken !== currentToken;
  }, [pendingMethodInfo, autopayMethodInfo]);

  const handleCancelManage = () => {
    setPendingMethodInfo(null);
    setPendingMethodId(null);
    navigate(paths.dashboard.overview());
  };

  const handleSavePaymentMethod = () => {
    const targetMethod = pendingMethodInfo || autopayMethodInfo;
    if (!targetMethod) return;

    const formData = new FormData();
    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);
    formData.append('payment_method_id_model', targetMethod?.card_token || (targetMethod as any)?.token || '');
    formData.append('is_form', '1');
    formData.append('auto_pay', '1');
    formData.append('id_select_card', String(targetMethod?.id ?? autoPaySettings?.id ?? ''));
    formData.append('auto_pay_model_save_card', '0');

    dispatch(
      updatePaperLessInfo(
        formData,
        'autopay',
        (res?: any) => {
          toast.success(res?.message || 'AutoPay setting updated');
          setAutopayMethodInfo(targetMethod);
          if (targetMethod?.id) setAutopayMethodId(targetMethod.id);
          setPendingMethodInfo(null);
          setPendingMethodId(null);
          handleHomeApi();
        },
        false,
        undefined,
        false
      )
    );
  };

  const hasSavedAutopayCard = Boolean(
    autopayMethodInfo?.id ||
    autopayMethodInfo?.card_token ||
    autopayMethodInfo?.token ||
    autopayMethodInfo?.card_number ||
    autopayMethodInfo?.bank_account_number ||
    autopayMethodInfo?.card_type ||
    autopayMethodInfo?.account_type ||
    dashBoardInfo?.body?.autopay_card?.id ||
    dashBoardInfo?.body?.autopay_card?.card_token
  );

  const location = useLocation();
  const fromToggle = (location.state as any)?.fromToggle;

  const getInitialView = (): ViewName => {
    if (fromToggle) {
      const isCurrentlyOn = isInitialAutopayOn();
      return isCurrentlyOn ? 'deactivate' : 'enroll-choose';
    }
    return 'dashboard';
  };

  const [view, setView] = useState<ViewName>(() => getInitialView());
  const [pendingDefaultModal, setPendingDefaultModal] = useState<string | null>(null); // newly-added method awaiting default decision
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [newCardSelected, setNewCardSelected] = useState(false);

  const myCards = useMemo(() => {
    if (Array.isArray(paymentMethodInfo) && paymentMethodInfo.length > 0) {
      return paymentMethodInfo;
    }
    if (Array.isArray(paymentDetailsInfo?.customer?.mycards) && paymentDetailsInfo.customer.mycards.length > 0) {
      return paymentDetailsInfo.customer.mycards;
    }
    if (Array.isArray(paymentDetailsInfo?.mycards) && paymentDetailsInfo.mycards.length > 0) {
      return paymentDetailsInfo.mycards;
    }
    if (Array.isArray((dashBoardInfo?.body?.customer as any)?.mycards) && (dashBoardInfo?.body?.customer as any).mycards.length > 0) {
      return (dashBoardInfo?.body?.customer as any).mycards;
    }
    if (Array.isArray((dashBoardInfo?.body as any)?.mycards) && (dashBoardInfo?.body as any).mycards.length > 0) {
      return (dashBoardInfo?.body as any).mycards;
    }
    return [];
  }, [paymentMethodInfo, paymentDetailsInfo, dashBoardInfo]);

  React.useEffect(() => {
    if (Array.isArray(myCards) && myCards.length > 0) {
      setMethods(myCards);
    }
  }, [myCards]);

  /* ---------------- State Sync from Home API ---------------- */
  React.useEffect(() => {
    const cardFromHome = dashBoardInfo?.body?.autopay_card;
    const autopayStatusFromHome = dashBoardInfo?.body?.customer?.autopay;

    if (cardFromHome) {
      setAutopayMethodInfo(cardFromHome);
      if (cardFromHome?.id) {
        setAutopayMethodId(cardFromHome.id);
      }
    }

    if (autopayStatusFromHome !== undefined && autopayStatusFromHome !== null) {
      const isEnabled = Number(autopayStatusFromHome) === 1;
      setAutopayEnabled(isEnabled);
      setisAutoPay(isEnabled);
      if (isEnabled) {
        setEverEnrolled(true);
      }
    }
  }, [dashBoardInfo]);

  /* ---------------- Dashboard toggle ---------------- */
  function handleToggle() {
    if (!autopayEnabled) {
      // OFF -> ON : Redirect to Step 1 Enroll in AutoPay
      const hasSavedCard = Boolean(
        autopayMethodInfo?.id ||
        autopayMethodInfo?.card_token ||
        autopayMethodInfo?.token ||
        autopayMethodInfo?.card_number ||
        autopayMethodInfo?.bank_account_number ||
        autopayMethodInfo?.card_type ||
        autopayMethodInfo?.account_type ||
        (methods && methods.length > 0) ||
        (myCards && myCards.length > 0)
      );
      setNewCardSelected(false);
      setPaymentType(hasSavedCard ? 'saved' : 'no-save');
      setView('enroll-choose');
    } else {
      // ON -> OFF : Redirect to Deactivate Page
      setView('deactivate');
    }
  }

  /* ---------------- Enrollment: existing method chosen ---------------- */
  function handleContinueExisting(methodId: string) {
    const selectedMethod = methods.find((m) => String(m.id) === String(methodId)) || (methods && methods.length > 0 ? methods[0] : null);
    if (selectedMethod) {
      setAutopayMethodInfo(selectedMethod as any);
    }
    setAutopayMethodId(methodId);
    setAuthChecked(false);
    setView('review');
  }

  /* ---------------- Enrollment: new method added via iframe ---------------- */
  function handleNewMethodFromEnroll(method: PaymentMethod) {
    const hasExistingDefault = methods.some((m) => m.isDefault);
    if (!hasExistingDefault) {
      // no default exists yet -> auto-designate as default
      const withNew = [...methods, { ...method, isDefault: true }];
      setMethods(withNew);
      setAutopayMethodId(method.id);
      setAuthChecked(false);
      setView('review');
    } else {
      // default exists -> ask
      setMethods((prev) => [...prev, { ...method, isDefault: false }]);
      setPendingDefaultModal(String(method.id));
    }
  }

  function resolveMakeDefault(makeDefault: boolean) {
    const newId = pendingDefaultModal;
    setMethods((prev) =>
      prev.map((m) => {
        if (m.id === newId) return { ...m, isDefault: makeDefault ? true : m.isDefault };
        return makeDefault ? { ...m, isDefault: false } : m;
      })
    );
    setAutopayMethodId(newId); // the newly added method is the one selected for autopay use
    setPendingDefaultModal(null);
    setAuthChecked(false);
    setView('review');
  }

  /* ---------------- Manage methods modal actions ---------------- */
  function handleRemoveMethod(id: string) {
    setMethods((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      // if we removed the default, promote another one
      if (!filtered.some((m) => m.isDefault) && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
  }

  function handleSetDefault(id: string) {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }

  function handleAddNewFromManage(method: PaymentMethod) {
    const hasExistingDefault = methods.some((m) => m.isDefault);
    setMethods((prev) => [...prev, { ...method, isDefault: !hasExistingDefault }]);
  }

  const handleHomeApi = () => {
    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);

    dispatch(getDashboardInfo(roleId, userId));
  }

  /* ---------------- Enrollment completion ---------------- */
  function handleEnroll() {
    setShowSuccess(true);
  }

  // const userInfo: CustomerInfo = getLocalStorage('intuity-customerInfo') as CustomerInfo;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [isAutoPay, setisAutoPay] = React.useState(false);
  const [autoPaySettings, setAutoPaySettings] = React.useState<any>(null);

  const { accountLoading } = useSelector((state: RootState) => state?.Account);

  const handleEnrollSave = () => {
    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);

    if (autopayMethodInfo) {
      formData.append('payment_method_id_model', autopayMethodInfo?.card_token || autopayMethodInfo?.token || '');

      formData.append('is_form', '1');
      formData.append('auto_pay', '1');

      formData.append('id_select_card', String(autopayMethodInfo?.id ?? autoPaySettings?.id ?? ''));
      formData.append('auto_pay_model_save_card', '0');
      dispatch(updatePaperLessInfo(formData, 'autopay', successCallBack, false,
        undefined,
        false));
      return;
    }
    formData.append('auto_pay', '1');

    formData.append('payment_method_id', userInfo?.payment_method_id);
    dispatch(updatePaperLessInfo(formData, 'autopay', successCallBack, false,
      undefined,
      false));
  };

  const successCallBack = () => {
    setShowSuccess(true);
    setisAutoPay(true);
    setAutopayEnabled(true);
    setEverEnrolled(true);
    updateLocalStorageValue('intuity-customerInfo', 'autopay', 1);
  };

  function finishEnrollment() {
    handleHomeApi();
    setShowSuccess(false);
    setAutopayEnabled(true);
    setEverEnrolled(true);
    setView('dashboard');
  }

  /* ---------------- Deactivation ---------------- */
  function handleDeactivateConfirm() {
    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);

    if (autopayMethodInfo) {
      formData.append('payment_method_id_model', autopayMethodInfo?.card_token || autopayMethodInfo?.token || '');

      formData.append('is_form', '1');
      formData.append('auto_pay', '0');

      formData.append('id_select_card', String(autopayMethodInfo?.id ?? autoPaySettings?.id ?? ''));
      formData.append('auto_pay_model_save_card', '0');
      dispatch(updatePaperLessInfo(formData, 'autopay', successCallBackDeactivate, false,
        undefined,
        false));
      return;
    }
    formData.append('auto_pay', '0');

    formData.append('payment_method_id', userInfo?.payment_method_id);
    dispatch(updatePaperLessInfo(formData, 'autopay', successCallBackDeactivate, false,
      undefined,
      false));
  }

  const successCallBackDeactivate = () => {
    setAutopayEnabled(false);
    setisAutoPay(false);
    setAutopayMethodInfo(null);
    updateLocalStorageValue('intuity-customerInfo', 'autopay', 0);
    setShowDeactivated(true);
  }
  function finishDeactivation() {
    handleHomeApi();
    setShowDeactivated(false);
    setAutopayEnabled(false);
    setAutopayMethodInfo(null);
    setView('dashboard');
  }
  function handleKeepAutopay() {
    setView('dashboard');
  }

  /* ---------------- Change payment method (from Dashboard link) ---------------- */
  function handleChangeMethod() {
    setAuthChecked(false);
    setNewCardSelected(false);
    const hasSavedAutopayCard = Boolean(
      autopayMethodInfo?.id ||
      autopayMethodInfo?.card_token ||
      autopayMethodInfo?.token ||
      autopayMethodInfo?.card_number ||
      autopayMethodInfo?.bank_account_number
    );
    setPaymentType(hasSavedAutopayCard ? 'saved' : '');
    setView('enroll-choose');
  }

  // On Mount

  useLayoutEffect(() => {
    setContextLoading(true);
  }, []);

  React.useEffect(() => {
    handleHomeApi();
  }, [true]);


  React.useEffect(() => {
    setisAutoPay(userInfo?.autopay === 1 ? true : false);

    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);

    dispatch(updatePaperLessInfo(formData, 'autopay', (data: any) => {
      if (data) {
        setAutopayMethodInfo(data);
        if (data?.id) setAutopayMethodId(data.id);
      }
      setContextLoading(false);
      // Mark first-load done — clear the skeleton once autopay-setting resolves
    }, true,
      setAutoPaySettings,
      false));
  }, [userInfo?.autopay]);

  /* ---------------- Render ---------------- */
  return (
    <Box sx={{ minHeight: '100%' }}>

      {/* Skeleton shown while initial APIs are loading */}
      {contextLoading && <AutoPaySkeleton />}

      {openPaymentModal && (
        <Dialog
          open={openPaymentModal}
          scroll="paper"
          fullWidth
          // maxWidth="95%"// ✅ disable preset sizes
          PaperProps={{
            sx: {
              maxHeight: { xs: '95vh', sm: "90vh" },
              maxWidth: "95%",
              margin: 0,
              width: { xs: '95%', sm: "830px" }, // ✅ custom fixed width
              borderRadius: '12px',
            },
          }}
        >
          <PaymentMethods
            onClose={() => {
              setOpenPaymentModal(false);
            }}
            defaultAutopayCard={autopayMethodInfo}
            useAutopayDefault={true}
            isModal={true}
            count={10}
            page={1}
            rows={[]}
            rowsPerPage={10}
            onSaveCardDetails={(data: any) => {
              try {
                if (data) {
                  if (view === 'dashboard') {
                    setPendingMethodInfo(data);
                    if (data?.id) setPendingMethodId(data.id);
                    setOpenPaymentModal(false);
                    return;
                  }
                  setAutopayMethodInfo(data);
                  if (data?.id) setAutopayMethodId(data.id);
                }
                setPaymentType('saved');
                setOpenPaymentModal(false);
                setNewCardSelected(true);
                setAuthChecked(false);
                if (view === 'enroll-choose') {
                  setView('review');
                }
              } catch (err) {
                console.error('Failed to parse card details', err);
              }
            }}
            paymentDetailsPage={true}
          />
        </Dialog>
      )}

      {bankModalOpen && (
        <AddBankAccountModal
          open={bankModalOpen}
          onClose={() => setBankModalOpen(false)}
          onSuccess={(bank) => {
            if (bank) {
              if (view === 'dashboard') {
                setPendingMethodInfo(bank);
                if (bank?.id) setPendingMethodId(bank.id);
                setBankModalOpen(false);
                return;
              }
              setAutopayMethodInfo(bank);
              if (bank?.id) setAutopayMethodId(bank.id);
            }
            setPaymentType('saved');
            setBankModalOpen(false);
            setNewCardSelected(true);
            setAuthChecked(false);
            if (view === 'enroll-choose') {
              setView('review');
            }
          }}
          onReturnCard={(data) => {
            const newlyAdded =
              data?.selected_card ||
              (Array.isArray(data?.mycards) && data.mycards[data.mycards.length - 1]) ||
              data;

            if (newlyAdded && typeof newlyAdded === 'object') {
              if (view === 'dashboard') {
                setPendingMethodInfo(newlyAdded);
                if (newlyAdded?.id) setPendingMethodId(newlyAdded.id);
                setBankModalOpen(false);
                return;
              }
              setAutopayMethodInfo(newlyAdded);
              if (newlyAdded?.id) setAutopayMethodId(newlyAdded.id);
            }
            if (Array.isArray(data?.mycards)) {
              setMethods(data.mycards);
            }
            setPaymentType('saved');
            setBankModalOpen(false);
            setNewCardSelected(true);
            setAuthChecked(false);
            if (view === 'enroll-choose') {
              setView('review');
            }
          }}
        />
      )}

      {cardModalOpen && (
        <AddCardModal
          open={cardModalOpen}
          onClose={() => setCardModalOpen(false)}
          onSuccess={(card) => {
            if (card) {
              if (view === 'dashboard') {
                setPendingMethodInfo(card);
                if (card?.id) setPendingMethodId(card.id);
                setCardModalOpen(false);
                return;
              }
              setAutopayMethodInfo(card);
              if (card?.id) setAutopayMethodId(card.id);
            }
            setPaymentType('saved');
            setCardModalOpen(false);
            setNewCardSelected(true);
            setAuthChecked(false);
            if (view === 'enroll-choose') {
              setView('review');
            }
          }}
          onReturnCard={(data) => {
            const newlyAdded =
              data?.selected_card ||
              (Array.isArray(data?.mycards) && data.mycards[data.mycards.length - 1]) ||
              data;

            if (newlyAdded && typeof newlyAdded === 'object') {
              if (view === 'dashboard') {
                setPendingMethodInfo(newlyAdded);
                if (newlyAdded?.id) setPendingMethodId(newlyAdded.id);
                setCardModalOpen(false);
                return;
              }
              setAutopayMethodInfo(newlyAdded);
              if (newlyAdded?.id) setAutopayMethodId(newlyAdded.id);
            }
            if (Array.isArray(data?.mycards)) {
              setMethods(data.mycards);
            }
            setPaymentType('saved');
            setCardModalOpen(false);
            setNewCardSelected(true);
            setAuthChecked(false);
            if (view === 'enroll-choose') {
              setView('review');
            }
          }}
        />
      )}

      {/* View content — hidden while the page is still loading */}
      <Box sx={{ display: contextLoading ? 'none' : 'block' }}>
        {view === 'dashboard' && (
          <Dashboard
            autopayEnabled={autopayEnabled}
            autopayMethodInfo={autopayMethodInfo}
            pendingMethodInfo={pendingMethodInfo}
            onToggle={handleToggle}
            onChangeMethod={() => setOpenPaymentModal(true)}
            onDeactivate={() => setView('deactivate')}
            onSetUp={() => {
              setPaymentType('');
              setNewCardSelected(false);
              setView('enroll-choose');
            }}
            onSave={handleSavePaymentMethod}
            onCancel={handleCancelManage}
            hasPendingChanges={hasPendingChanges}
            accountLoading={accountLoading}
            accountNo={accountNumber}
            name={customerName}
          />
        )}

        {view === 'enroll-choose' && (
          <EnrollChoose
            methods={methods}
            setCardModalOpen={setCardModalOpen}
            setBankModalOpen={setBankModalOpen}
            setOpenPaymentModal={setOpenPaymentModal}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            onContinueExisting={handleContinueExisting}
            onNewMethodContinue={handleNewMethodFromEnroll}
            autopayMethodInfo={autopayMethodInfo}
            newCardSelected={newCardSelected}
            onCancel={() => navigate(paths.dashboard.overview())}
            accountNo={accountNumber}
            amountDue={billAmountDue}
            dueDate={formattedBillDueDate}
          />
        )}

        {view === 'review' && (
          <ReviewConfirm
            methods={methods}
            autopayMethodId={autopayMethodId as string}
            setAutopayMethodId={setAutopayMethodId}
            authChecked={authChecked}
            setAuthChecked={setAuthChecked}
            onBack={() => setView('enroll-choose')}
            onEnroll={handleEnroll}
            onRemove={handleRemoveMethod}
            accountLoading={accountLoading}
            onSetDefault={handleSetDefault}
            onAddNew={handleAddNewFromManage}
            handleEnrollSave={handleEnrollSave}
            accountNo={accountNumber}
            amountDue={billAmountDue}
            dueDate={formattedBillDueDate}
            autopayMethodInfo={autopayMethodInfo}
            setAutopayMethodInfo={setAutopayMethodInfo}
            userInfo={userInfo}
            isAutoPay={isAutoPay}
            setisAutoPay={setisAutoPay}
            setOpenPaymentModal={setOpenPaymentModal}
            openPaymentModal={openPaymentModal}
          />
        )}

        {view === 'deactivate' && (
          <DeactivatePage
            method={autopayMethodInfo}
            onKeep={handleKeepAutopay}
            onDeactivate={handleDeactivateConfirm}
            accountNo={accountNumber}
            accountLoading={accountLoading}
            amountDue={billAmountDue}
            dueDate={formattedBillDueDate}
          />
        )}

        {pendingDefaultModal && (
          <MakeDefaultModal onYes={() => resolveMakeDefault(true)} onNo={() => resolveMakeDefault(false)} />
        )}

        {showSuccess && <SuccessModal onDone={finishEnrollment} />}
        {showDeactivated && <DeactivatedModal onOk={finishDeactivation} />}
      </Box>
    </Box>
  );
}

