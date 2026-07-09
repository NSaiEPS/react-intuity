import * as React from 'react';
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import ButtonComp from '@mui/material/Button';
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
import { Button } from 'nsaicomponents';

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
  Info,
  Question,
} from '@phosphor-icons/react';

/* ------------------------------------------------------------------ *
 *  Real payment-capture modals (already wired to your APIs)
 *  Adjust these import paths to match where they live in your app.
 * ------------------------------------------------------------------ */
import AddBankAccountModal from '../add-bank-modal';
import AddCardModal from '../add-card-modal';

import { useDispatch, useSelector } from '@/hooks/redux';
import { RootState } from '@/state/store';
import { getLocalStorage, IntuityUser, updateLocalStorageValue } from '@/utils/auth';
import { getPaymentProcessorDetails, getConvenienceFee, getPaymentDetails, updatePaperLessInfo } from '@/state/features/accountSlice';
import { colors, CustomerInfo } from '@/utils';
import dayjs from 'dayjs';
import { tooltipSx } from '@/utils/config';
import { CardDetails, PaymentMethods } from '../payment-methods';
import { getCardLast4, renderCardBrand } from '../../account/payment-details';

/* ------------------------------------------------------------------ *
 *  Types
 * ------------------------------------------------------------------ */
type MethodType = 'card' | 'bank';

interface PaymentMethod {
  id: string;
  type: MethodType;
  brand: string;
  last4: string;
  isDefault: boolean;
}

type ViewName = 'dashboard' | 'enroll-choose' | 'review' | 'deactivate';

/* ------------------------------------------------------------------ *
 *  Dummy vs. real payment capture
 *
 *  While AddCardModal / AddBankAccountModal's success wiring is still
 *  being finished, every "Credit Card" / "Bank Account" radio in the
 *  enrollment screen falls back to a dummy in-memory simulation
 *  (PaymentIframe) so the rest of the flow (Review & Confirm, default
 *  handling, etc.) can be exercised end-to-end without a real API call.
 *
 *  Flip this to `false` once you're ready to go live with the real
 *  modals — no other UI changes are needed. See the notes above
 *  `handleRealModalSuccess` in EnrollChoose for what still needs
 *  wiring on the modal side.
 * ------------------------------------------------------------------ */
const USE_DUMMY_PAYMENT_FLOW = true;

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
    ['Bill Amount Due', amountDue],
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
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
    ? `${method.brand} ending in ${method.last4}`
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
 *  Payment capture "iFrame" simulation
 * ------------------------------------------------------------------ */
function PaymentIframe({
  type,
  onContinue,
}: {
  type: MethodType;
  onContinue: (method: PaymentMethod) => void;
}) {
  const [clicked, setClicked] = useState(false);

  const handleContinue = () => {
    if (clicked) return;
    setClicked(true);
    const method: PaymentMethod =
      type === 'card'
        ? {
          id: uid(),
          type: 'card',
          brand: ['Visa', 'Mastercard', 'Amex'][Math.floor(Math.random() * 3)],
          last4: String(Math.floor(1000 + Math.random() * 9000)),
          isDefault: false,
        }
        : {
          id: uid(),
          type: 'bank',
          brand: 'Checking',
          last4: String(Math.floor(1000 + Math.random() * 9000)),
          isDefault: false,
        };
    onContinue(method);
  };

  return (
    <Box
      sx={{
        border: `1.5px dashed ${palette.grayLight}`,
        borderRadius: 2,
        p: 2,
        bgcolor: palette.canvas,
        my: 1,
      }}
    >
      <Typography
        variant="overline"
        sx={{ color: palette.grayLight, fontWeight: 800, letterSpacing: '.06em', display: 'block', mb: 1 }}
      >
        Secure payment form
      </Typography>

      {type === 'card' ? (
        <Stack spacing={1.5} sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1.5}>
            <TextField label="Card Number" placeholder="•••• •••• •••• ••••" size="small" fullWidth />
            <TextField label="CVV" placeholder="•••" size="small" sx={{ maxWidth: 100 }} />
          </Stack>
          <TextField label="Expiration" placeholder="MM / YY" size="small" sx={{ maxWidth: 160 }} />
        </Stack>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 1 }}>
          <TextField label="Routing Number" placeholder="123456789" size="small" fullWidth />
          <TextField label="Account Number" placeholder="00001234567" size="small" fullWidth />
          <TextField label="Account Type" select size="small" defaultValue="checking" fullWidth>
            <MenuItem value="checking">Checking</MenuItem>
            <MenuItem value="savings">Savings</MenuItem>
          </TextField>
        </Stack>
      )}

      <FormControlLabel
        control={<Checkbox size="small" defaultChecked />}
        label={
          <Typography variant="caption" sx={{ color: palette.gray }}>
            I authorize this form to store and enroll the payment method indicated for one-time and/or auto
            recurring transactions on or before the due date.
          </Typography>
        }
        sx={{ alignItems: 'flex-start', mt: 0.5 }}
      />
      <FormControlLabel
        control={<Checkbox size="small" defaultChecked />}
        label={<Typography variant="caption" sx={{ color: palette.gray }}>I'm not a robot</Typography>}
        sx={{ alignItems: 'flex-start', display: 'block' }}
      />

      {!clicked && (
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: palette.red, fontWeight: 700, fontSize: 12, my: 1 }}>
          <Warning size={14} weight="bold" />
          <span>Only click Continue once!</span>
        </Stack>
      )}

      <Button variant="contained" fullWidth onClick={handleContinue} disabled={clicked} sx={{ mt: 1 }}>
        {clicked ? 'Processing…' : 'Continue'}
      </Button>
    </Box>
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
  selectedCardDetails,
}: {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenManage: () => void;
  selectedCardDetails?: CardDetails;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const selected = methods.find((m) => m.id === selectedId) as PaymentMethod;

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
          selectedCardDetails?.id && (
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
              {renderCardBrand(selectedCardDetails?.card_type ?? selectedCardDetails?.account_type)}

              <Typography sx={{ fontSize: '14px', color: '#2C3E50', fontWeight: 500 }}>
                {selectedCardDetails?.card_type || selectedCardDetails?.account_type || 'Card'} ending in{' '}
                {getCardLast4(selectedCardDetails)}
              </Typography>

              {/* Default Badge */}
              <Box
                onClick={() => {
                  onOpenManage();
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
                  onOpenManage();
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
          )
        }
        {/* Add/Edit Button */}
        <ButtonComp
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onOpenManage();
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
        </ButtonComp>
      </Box>



      {/* <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
        <Card
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ flex: 1, cursor: 'pointer', borderColor: palette.line }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1.5, py: 1 }}>
            <MethodIcon type={selected.type} />
            <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{methodLabel(selected)}</Typography>
            <DefaultChip isDefault={selected.isDefault} />
            <CaretDown size={16} color={palette.gray} />
          </Stack>
        </Card>
        <Button variant="contained" size="small" onClick={onOpenManage} sx={{ flexShrink: 0 }}>
          Add/Remove
        </Button>
      </Stack> */}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {methods.map((m) => (
          <MenuItem
            key={m.id}
            selected={m.id === selectedId}
            onClick={() => {
              onSelect(m.id);
              setAnchorEl(null);
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: 260 }}>
              <MethodIcon type={m.type} />
              <Typography sx={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{methodLabel(m)}</Typography>
              {m.isDefault && <DefaultChip isDefault />}
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

/* ------------------------------------------------------------------ *
 *  Manage payment methods modal (Add/Remove)
 * ------------------------------------------------------------------ */
// function ManageMethodsModal({
//   methods,
//   autopayMethodId,
//   onClose,
//   onRemove,
//   onSetDefault,
//   onAddNew,
// }: {
//   methods: PaymentMethod[];
//   autopayMethodId: string;
//   onClose: () => void;
//   onRemove: (id: string) => void;
//   onSetDefault: (id: string) => void;
//   onAddNew: (method: PaymentMethod) => void;
// }) {
//   const [adding, setAdding] = useState(false);
//   const [addType, setAddType] = useState<MethodType | null>(null);

//   return (
//     <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
//       <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: palette.navy, fontWeight: 800 }}>
//         Payment Methods
//         <IconButton size="small" onClick={onClose}>
//           <X size={16} />
//         </IconButton>
//       </DialogTitle>
//       <DialogContent dividers>
//         {!adding && (
//           <Stack spacing={1}>
//             {methods.map((m) => (
//               <Card key={m.id} variant="outlined" sx={{ borderColor: palette.line }}>
//                 <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25 }}>
//                   <MethodIcon type={m.type} />
//                   <Box sx={{ flex: 1 }}>
//                     <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{methodLabel(m)}</Typography>
//                     <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
//                       {m.isDefault ? (
//                         <DefaultChip isDefault />
//                       ) : (
//                         <Button size="small" onClick={() => onSetDefault(m.id)} sx={{ p: 0, minWidth: 0, textTransform: 'none' }}>
//                           Make default
//                         </Button>
//                       )}
//                       {m.id === autopayMethodId && <Chip size="small" label="Used for AutoPay" />}
//                     </Stack>
//                   </Box>
//                   <IconButton
//                     size="small"
//                     onClick={() => onRemove(m.id)}
//                     disabled={m.id === autopayMethodId || methods.length === 1}
//                     title={m.id === autopayMethodId ? "Can't remove the method used for AutoPay" : 'Remove'}
//                   >
//                     <Trash size={16} />
//                   </IconButton>
//                 </Stack>
//               </Card>
//             ))}
//             <Button variant="outlined" startIcon={<Plus size={15} />} onClick={() => setAdding(true)}>
//               Add a new payment method
//             </Button>
//           </Stack>
//         )}

//         {adding && !addType && (
//           <Stack spacing={1}>
//             <RadioGroup value={addType ?? ''}>
//               <FormControlLabel value="card" control={<Radio onClick={() => setAddType('card')} />} label="Credit Card" />
//               <FormControlLabel value="bank" control={<Radio onClick={() => setAddType('bank')} />} label="Bank Account (ACH)" />
//             </RadioGroup>
//             <Button variant="outlined" onClick={() => setAdding(false)}>
//               Cancel
//             </Button>
//           </Stack>
//         )}

//         {adding && addType && (
//           <PaymentIframe
//             type={addType}
//             onContinue={(method) => {
//               onAddNew(method);
//               setAdding(false);
//               setAddType(null);
//             }}
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

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
  selectedCardDetails,
  setSelectedCardDetails,
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
  isAutoPay: boolean;
  accountLoading: boolean;
  selectedCardDetails: CardDetails | null;
  setSelectedCardDetails: React.Dispatch<React.SetStateAction<CardDetails | null>>;
}) {
  // const [manageOpen, setManageOpen] = useState(false);

  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <ShieldCheck size={20} color={palette.navy} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: palette.navy }}>
          Review &amp; Confirm
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: palette.gray, mb: 2.5 }}>
        Confirm the payment method you'd like to use for AutoPay.
      </Typography>

      <Card variant="none" sx={{ p: 1, borderRadius: 0 }}>
        <AccountBanner accountNo={accountNo} amountDue={amountDue} dueDate={dueDate} />
        <StepRail step={2} />
        <PaymentMethodSelector
          methods={methods}
          selectedId={autopayMethodId}
          onSelect={setAutopayMethodId}
          selectedCardDetails={selectedCardDetails}
          onOpenManage={() => setOpenPaymentModal(true)}
        />

        <Card variant='none' sx={{ py: 1.75, my: 2.25 }}>
          <FormControlLabel
            sx={{ alignItems: 'flex-start' }}
            control={
              <Checkbox
                checked={authChecked}
                onChange={(e) => setAuthChecked(e.target.checked)}
                sx={{ pt: 0 }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: 12.5, lineHeight: 1.55 }}>
                I authorize [Company Name] to automatically charge my selected payment method for the total amount
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
              height: '41px',
            }}
            onClick={() => {
              setisAutoPay(userInfo?.autopay === 1);
              onBack()
            }}>
            Back
          </Button>
          <Button
            disabled={
              !authChecked ||
              accountLoading ||
              (selectedCardDetails ? false :
                (userInfo?.autopay === 1 && isAutoPay) ||
                (userInfo?.autopay !== 1 && !isAutoPay)
              )
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
              width: "fit-content"
            }}
          >
            Enroll in AutoPay
          </Button>
        </Stack>
      </Card>

      {openPaymentModal && (
        <Dialog
          open={openPaymentModal}
          scroll="paper"
          fullWidth
          maxWidth={false} // ✅ disable preset sizes
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              width: '830px', // ✅ custom fixed width
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
                setOpenPaymentModal(false);
                // setOpenConfirm(true);
              } catch {
                console.error('Failed to parse card details');
              }
            }}
            paymentDetailsPage={true}
          />
        </Dialog>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------ *
 *  Enrollment "choose payment method" screen (Scenarios 1-3, step 1)
 * ------------------------------------------------------------------ */
function EnrollChoose({
  methods,
  onContinueExisting,
  onNewMethodContinue,
  onCancel,
  accountNo,
  amountDue,
  dueDate,
}: {
  methods: PaymentMethod[];
  onContinueExisting: (id: string) => void;
  onNewMethodContinue: (method: PaymentMethod) => void;
  onCancel: () => void;
  accountNo: string;
  amountDue: string;
  dueDate: string;
}) {
  const hasSaved = methods.length > 0;
  const defaultMethod = methods.find((m) => m.isDefault) || methods[0];

  const [mode, setMode] = useState<'existing' | 'new'>(hasSaved ? 'existing' : 'new');
  const [pickedExistingId, setPickedExistingId] = useState<string | null>(
    defaultMethod ? defaultMethod.id : null
  );
  // Which "new payment method" type is selected — used for both Scenario 1
  // (top-level radios) and Scenario 3 (nested radios under "Add a new
  // payment method"). Drives either the dummy simulation or the real
  // capture modal, depending on USE_DUMMY_PAYMENT_FLOW.
  const [newType, setNewType] = useState<MethodType | null>(null);

  const [showDummyIframe, setShowDummyIframe] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);

  const canContinue = mode === 'existing' ? !!pickedExistingId : false;

  function handleSelectNewType(type: MethodType) {
    setMode('new');
    setNewType(type);
    if (USE_DUMMY_PAYMENT_FLOW) {
      setShowDummyIframe(true);
    } else if (type === 'card') {
      setCardModalOpen(true);
    } else {
      setBankModalOpen(true);
    }
  }

  function closeDummyDialog() {
    setShowDummyIframe(false);
  }

  // Called by the dummy PaymentIframe simulation on "Continue".
  function handleDummyContinue(method: PaymentMethod) {
    setShowDummyIframe(false);
    onNewMethodContinue(method);
  }

  // --- Real API path -----------------------------------------------
  // Called once AddCardModal / AddBankAccountModal actually report a
  // successful save. See the note above USE_DUMMY_PAYMENT_FLOW at the
  // top of the file for what still needs to change on the modal side
  // before this can be wired up for real (their onSuccess is currently
  // commented out below because their signature doesn't hand back a
  // PaymentMethod yet).
  function handleRealModalSuccess(method: PaymentMethod) {
    setCardModalOpen(false);
    setBankModalOpen(false);
    onNewMethodContinue(method);
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: 20 }}>$</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, color: palette.navy }}>
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

      <Card variant="outlined" sx={{ p: 2.5, borderColor: palette.line }}>
        {hasSaved && (
          <Typography variant="overline" sx={{ color: palette.gray, fontWeight: 800, letterSpacing: '.04em' }}>
            Payment Method
          </Typography>
        )}

        <Stack spacing={1} sx={{ mt: 1, mb: 1 }}>
          {/* Scenarios 2 & 3: at least one saved method exists. */}
          {hasSaved && (
            <>
              {methods.map((m) => (
                <Card
                  key={m.id}
                  variant="outlined"
                  onClick={() => {
                    setMode('existing');
                    setPickedExistingId(m.id);
                  }}
                  sx={{
                    cursor: 'pointer',
                    borderColor: mode === 'existing' && pickedExistingId === m.id ? palette.blue : palette.line,
                    bgcolor: mode === 'existing' && pickedExistingId === m.id ? palette.blueLight : 'transparent',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.25 }}>
                    <Radio checked={mode === 'existing' && pickedExistingId === m.id} size="small" />
                    <MethodIcon type={m.type} />
                    <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{methodLabel(m)}</Typography>
                    <DefaultChip isDefault={m.isDefault} />
                  </Stack>
                </Card>
              ))}

              {/* Scenario 3: "Add a new payment method" — expands into a
                  nested Credit Card / Bank Account radio choice. */}
              <Card
                variant="outlined"
                sx={{
                  borderColor: mode === 'new' ? palette.blue : palette.line,
                  bgcolor: mode === 'new' ? palette.blueLight : 'transparent',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  onClick={() => setMode('new')}
                  sx={{ p: 1.25, cursor: 'pointer' }}
                >
                  <Radio checked={mode === 'new'} size="small" />
                  <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Add a new payment method</Typography>
                </Stack>

                {mode === 'new' && (
                  <Box sx={{ pl: 4.5, pb: 1.5, pr: 1.5 }}>
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSelectNewType('card')}
                      >
                        <ArrowBendDownRight size={14} color={palette.grayLight} style={{ flexShrink: 0 }} />
                        <Radio checked={newType === 'card'} size="small" />
                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Credit Card</Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSelectNewType('bank')}
                      >
                        <ArrowBendDownRight size={14} color={palette.grayLight} style={{ flexShrink: 0 }} />
                        <Radio checked={newType === 'bank'} size="small" />
                        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Bank Account</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                )}
              </Card>
            </>
          )}

          {/* Scenario 1: no saved methods yet — Credit Card / Bank Account
              are the only, top-level choice. */}
          {!hasSaved && (
            <Stack direction="row" spacing={3} sx={{ mb: 0.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleSelectNewType('card')}
              >
                <Radio checked={newType === 'card'} size="small" />
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Credit Card</Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleSelectNewType('bank')}
              >
                <Radio checked={newType === 'bank'} size="small" />
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Bank Account</Typography>
                <Tooltip title={
                  <span style={{ fontSize: "14px", lineHeight: 1.4 }}>A checking or savings account used for ACH/direct-debit payments.</span>}

                  placement="top"
                  arrow
                  enterTouchDelay={0}
                  leaveTouchDelay={3000}
                  componentsProps={{ tooltip: { sx: tooltipSx } }}
                >
                  <IconButton size="small" sx={{ mr: 1 }}>
                    <Question size={20} color="#90caf9" weight="fill" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          )}
        </Stack>

        {mode === 'existing' && (
          <Stack direction="row"
            spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="outlined" fullWidth onClick={onCancel} style={{
              color: colors.blue,
              borderColor: colors.blue,
              backgroundColor: "white",
              borderRadius: '12px',
              height: '41px',
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              textTransform="none"
              bgColor={colors.blue}
              hoverBackgroundColor={colors['blue.3']}
              hoverColor="white"
              fullWidth
              style={{
                borderRadius: '12px',
                height: '41px',
              }}
              disabled={!canContinue}
              onClick={() => onContinueExisting(pickedExistingId as string)}
            >
              Continue
            </Button>
          </Stack>
        )}
      </Card>

      {/* Dummy simulation — active while USE_DUMMY_PAYMENT_FLOW is true. */}
      {showDummyIframe && (
        <Dialog open={showDummyIframe} onClose={closeDummyDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: palette.navy, fontWeight: 800 }}>
            {newType === 'card' ? 'Add Credit Card' : 'Add Bank Account'}
            <IconButton size="small" onClick={closeDummyDialog}>
              <X size={16} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <PaymentIframe type={newType!} onContinue={handleDummyContinue} />
          </DialogContent>
        </Dialog>
      )}

      {/* Real API modals — active once USE_DUMMY_PAYMENT_FLOW is false. */}
      {cardModalOpen && (
        <AddCardModal
          open={cardModalOpen}
          onClose={() => setCardModalOpen(false)}
        // onSuccess={handleRealModalSuccess}
        />
      )}

      {bankModalOpen && (
        <AddBankAccountModal
          open={bankModalOpen}
          onClose={() => setBankModalOpen(false)}
        // onSuccess={handleRealModalSuccess}
        />
      )}
    </Box>
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
  method: PaymentMethod;
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

      <Card variant="none" sx={{ py: 2.5, borderColor: palette.line }}>
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
          <Stack direction="row" justifyContent="space-between" sx={{ py: 0.3 }}>
            <Typography variant="body2" sx={{ color: palette.navy, fontWeight: 600 }}>
              Payment Method
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {methodLabel(method)}
            </Typography>
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
          sx={{ alignItems: 'flex-start', mb: 1 }}
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} sx={{ pt: 0 }} />}
          label={
            <Typography variant="body2">
              I understand that AutoPay will be deactivated and I will need to make payments manually.
            </Typography>
          }
        />

        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
          <Button variant="outlined" fullWidth onClick={onKeep}
            textTransform="capitalize"

            style={{
              color: colors.blue,
              borderColor: colors.blue,
              backgroundColor: "white",
              borderRadius: '12px',
              height: '41px',
            }}>
            Keep AutoPay
          </Button>
          <Button
            variant="contained"
            style={{
              backgroundColor: palette.red,
              borderRadius: '12px',
              height: '41px',
            }}
            textTransform="none"
            hoverBackgroundColor={'white'}
            hoverColor="white"
            loading={accountLoading}
            fullWidth disabled={!checked} onClick={onDeactivate}>
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
  autopayMethod,
  onToggle,
  onChangeMethod,
  accountNo,
  name,
}: {
  autopayEnabled: boolean;
  autopayMethod: PaymentMethod | null;
  onToggle: () => void;
  onChangeMethod: () => void;
  accountNo: string;
  name: string;
}) {
  return (
    <Box sx={{ maxWidth: "100%", mx: 'auto' }}>
      <Card variant="outlined" sx={{ borderColor: palette.line }}>
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: palette.ink, lineHeight: 1.2 }}>
                AutoPay Settings
              </Typography>
              <Typography variant="body2" sx={{ color: palette.gray, mt: 0.25 }}>
                Current Autopay Method
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="body2" sx={{ color: palette.ink }}>
                Account No: {accountNo}
              </Typography>
              <Typography variant="body2" sx={{ color: palette.ink }}>
                Name: {name}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1.5}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: palette.ink }}>
                Autopay must be enabled 24 hours prior to your invoice autopay collection date to ensure processing.
              </Typography>
              <FormControlLabel
                sx={{ mt: 1, ml: -0.5 }}
                control={<Checkbox checked={autopayEnabled} onChange={onToggle} />}
                label={<Typography sx={{ fontWeight: 700 }}>Auto Pay {autopayEnabled ? 'ON' : 'OFF'}</Typography>}
              />
            </Box>

            {autopayEnabled && (
              <Button
                variant="outlined"
                onClick={onChangeMethod}
                textTransform="none"
                style={{
                  color: colors.blue,
                  borderColor: colors.blue,
                  backgroundColor: "white",
                  borderRadius: '12px',
                  height: '41px',
                }}
              >
                Change Payment Method
              </Button>
            )}
          </Stack>

          {autopayEnabled && autopayMethod && (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <MethodIcon type={autopayMethod.type} />
                <Box>
                  <Typography variant="caption" sx={{ color: palette.gray, fontWeight: 700, display: 'block' }}>
                    Paying with
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{methodLabel(autopayMethod)}</Typography>
                </Box>
              </Stack>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}

export default function AutoPayPrototype() {
  const dispatch = useDispatch();

  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);
  const userInfo: CustomerInfo = getLocalStorage('intuity-customerInfo') as CustomerInfo;
  const paymentDetailsInfo = useSelector((state: RootState) => state?.Account?.paymentDetailsInfo);

  const raw = userInfo?.body ? userInfo : getLocalStorage('intuity-user');
  const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;

  const CustomerInfo: CustomerInfo | null = dashBoardInfo?.body?.customer
    ? (dashBoardInfo?.body?.customer as unknown as CustomerInfo)
    : (getLocalStorage('intuity-customerInfo') as CustomerInfo | null);

  const myCustomerDetails = userInfo?.body as any;
  const billAmountDueValue =
    paymentDetailsInfo?.customer?.balance ?? myCustomerDetails?.balance ?? CustomerInfo?.balance ?? 0;
  const billAmountDueNumber = Number(String(billAmountDueValue).replace(/[^0-9.-]/g, ''));
  const billAmountDue = Number.isFinite(billAmountDueNumber) ? `$${billAmountDueNumber.toFixed(2)}` : '$0.00';

  const customerInfoDetails = CustomerInfo as any;
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
    if (CustomerInfo?.company_id) {
      const formdata = new FormData();
      formdata.append('acl_role_id', stored?.body?.acl_role_id || '');
      formdata.append('company_id', CustomerInfo?.company_id);
      dispatch(getPaymentProcessorDetails(formdata, false));

      const convenienceFeeFormdata = new FormData();
      convenienceFeeFormdata.append('acl_role_id', stored?.body?.acl_role_id || '');
      convenienceFeeFormdata.append('customer_id', stored?.body?.customer_id || '');
      dispatch(getConvenienceFee(convenienceFeeFormdata));

      const paymentDetailsFormdata = new FormData();
      paymentDetailsFormdata.append('acl_role_id', stored?.body?.acl_role_id || '');
      paymentDetailsFormdata.append('customer_id', stored?.body?.customer_id || '');
      dispatch(getPaymentDetails(paymentDetailsFormdata));
    }
  }, [CustomerInfo, stored, dispatch]);

  // seed data toggles — flip these to try different starting scenarios
  const [methods, setMethods] = useState<PaymentMethod[]>([
    // start with ZERO saved methods to exercise Scenario 1.
    // Try seeding one method below to exercise Scenarios 2 & 3 instead:
    // { id: "seed1", type: "card", brand: "Visa", last4: "1111", isDefault: true },
  ]);

  const [autopayEnabled, setAutopayEnabled] = useState(false);
  const [everEnrolled, setEverEnrolled] = useState(false);
  const [autopayMethodId, setAutopayMethodId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [view, setView] = useState<ViewName>('dashboard');
  const [pendingDefaultModal, setPendingDefaultModal] = useState<string | null>(null); // newly-added method awaiting default decision
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeactivated, setShowDeactivated] = useState(false);

  const autopayMethod = useMemo<PaymentMethod | null>(
    () => methods.find((m) => m.id === autopayMethodId) || null,
    [methods, autopayMethodId]
  );

  /* ---------------- Dashboard toggle ---------------- */
  function handleToggle() {
    if (!autopayEnabled) {
      // OFF -> ON
      if (everEnrolled && autopayMethodId) {
        // Previously enrolled, currently disabled -> straight to Review & Confirm
        setAuthChecked(false); // must reselect
        setView('review');
      } else {
        // Never enrolled -> go through enrollment choose step
        // (works whether or not there are saved methods)
        setView('enroll-choose');
      }
    } else {
      // ON -> OFF : go to the Deactivate page
      setView('deactivate');
    }
  }

  /* ---------------- Enrollment: existing method chosen ---------------- */
  function handleContinueExisting(methodId: string) {
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
      setPendingDefaultModal(method.id);
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

  /* ---------------- Enrollment completion ---------------- */
  function handleEnroll() {
    setShowSuccess(true);
  }

  // const userInfo: CustomerInfo = getLocalStorage('intuity-customerInfo') as CustomerInfo;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const [selectedCardDetails, setSelectedCardDetails] = useState<CardDetails>(null);
  const [isAutoPay, setisAutoPay] = React.useState(false);
  const [autoPayDetails, setAutoPayDetails] = React.useState(null);

  const [autoPaySettings, setAutoPaySettings] = React.useState(null);

  const { accountLoading } = useSelector((state: RootState) => state?.Account);

  const handleEnrollSave = () => {
    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);

    if (selectedCardDetails) {
      formData.append('payment_method_id_model', selectedCardDetails?.card_token || selectedCardDetails?.token || '');

      formData.append('is_form', '1');
      formData.append('auto_pay', isAutoPay ? '1' : '0');

      formData.append('id_select_card', autoPaySettings?.id ?? '');
      formData.append('auto_pay_model_save_card', '0');
      dispatch(updatePaperLessInfo(formData, 'autopay', successCallBack));
      return;
    }
    formData.append('auto_pay', isAutoPay ? '1' : '0');

    formData.append('payment_method_id', userInfo?.payment_method_id);
    dispatch(updatePaperLessInfo(formData, 'autopay', successCallBack));
  };

  const successCallBack = () => {
    setShowSuccess(true);
    updateLocalStorageValue('intuity-customerInfo', 'autopay', isAutoPay ? 1 : 0);
  };

  function finishEnrollment() {
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

    if (selectedCardDetails) {
      formData.append('payment_method_id_model', selectedCardDetails?.card_token || selectedCardDetails?.token || '');

      formData.append('is_form', '1');
      formData.append('auto_pay', '0');

      formData.append('id_select_card', autoPaySettings?.id ?? '');
      formData.append('auto_pay_model_save_card', '0');
      dispatch(updatePaperLessInfo(formData, 'autopay', successCallBackDeactivate));
      return;
    }
    formData.append('auto_pay', '0');

    formData.append('payment_method_id', userInfo?.payment_method_id);
    dispatch(updatePaperLessInfo(formData, 'autopay', successCallBackDeactivate));
    setShowDeactivated(true);
  }

  const successCallBackDeactivate = () => {
    setAutopayEnabled(false);
    setView('dashboard');
    setShowDeactivated(true);
  }
  function finishDeactivation() {
    setShowDeactivated(false);
    setAutopayEnabled(false);
    setView('dashboard');
  }
  function handleKeepAutopay() {
    setView('dashboard');
  }

  /* ---------------- Change payment method (from Dashboard link) ---------------- */
  function handleChangeMethod() {
    setAuthChecked(false);
    setView('review');
  }

  // On Mount

  React.useEffect(() => {
    setisAutoPay(CustomerInfo?.autopay === 1 ? true : false);

    const formData = new FormData();

    formData.append('acl_role_id', roleId);
    formData.append('customer_id', userId);

    dispatch(updatePaperLessInfo(formData, 'autopay', setAutoPayDetails, true, setAutoPaySettings));
  }, [CustomerInfo?.autopay]);

  /* ---------------- Render ---------------- */
  return (
    <Box sx={{ minHeight: '100%', p: { xs: 2, sm: 3.5 } }}>
      {view === 'dashboard' && (
        <Dashboard
          autopayEnabled={autopayEnabled}
          autopayMethod={autopayMethod}
          onToggle={handleToggle}
          onChangeMethod={handleChangeMethod}
          accountNo={accountNumber}
          name={customerName}
        />
      )}

      {view === 'enroll-choose' && (
        <EnrollChoose
          methods={methods}
          onContinueExisting={handleContinueExisting}
          onNewMethodContinue={handleNewMethodFromEnroll}
          onCancel={() => setView('dashboard')}
          accountNo={accountNumber}
          amountDue={billAmountDue}
          dueDate={formattedBillDueDate}
        />
      )}

      {view === 'review' && autopayMethod && (
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
          selectedCardDetails={selectedCardDetails}
          setSelectedCardDetails={setSelectedCardDetails}
          userInfo={userInfo}
          isAutoPay={isAutoPay}
          setisAutoPay={setisAutoPay}
        />
      )}

      {view === 'deactivate' && autopayMethod && (
        <DeactivatePage
          method={autopayMethod}
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
  );
}
