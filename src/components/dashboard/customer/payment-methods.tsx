import * as React from 'react';
import { deleteCardAndBankAccount, getPaymentDetails, getPaymentProcessorDetails } from '@/state/features/accountSlice';
import { RootState } from '@/state/store';
import { boarderRadius, colors, CustomerInfo, decryptFunction } from '@/utils';
import { getLocalStorage } from '@/utils/auth';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  Checkbox,
  DialogActions,
  Divider,
  Grid,
  IconButton,
  Link,
  Popover,
  Radio,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Bank, CreditCard, Plus, Question, Trash, X } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { CustomBackdrop, Loader } from 'nsaicomponents';

import { useDispatch, useSelector } from '@/hooks/redux';
// import { useLoading } from '@/components/core/skeletion-context';
import { SkeletonWrapper } from '@/components/core/withSkeleton';
import { ConfirmDialog } from '@/styles/theme/components/ConfirmDialog';

import AddBankAccountModal from './add-bank-modal';
import AddCardModal from './add-card-modal';
import { useLoading } from '@/components/core/skeleton-context';
import { tooltipSx } from '@/utils/config';
import { PaymentCard } from '@/types/domain';
import { RemovePaymentMethodDialog } from '@/styles/theme/components/RemovePaymentMethodDialog';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface CardDetails {
  name: string;
  number: string;
  type: string;
  createdAt: string;
  id: number;
  isBank: boolean;
  card_token: number;
  card_type?: string;
  bank_account_number?: string;
  account_type?: string;
  date_used?: string;
  expiration_month?: string | number;
  expiration_year?: string | number;
}

interface CustomersTableProps {
  count?: number;
  page?: number;
  rows?: CardDetails[];
  rowsPerPage?: number;
  isModal?: boolean;
  onClose?: () => void;
  accountInfo?: boolean;
  onSaveCardDetails?: (e: string) => void;
  paymentDetailsPage?: boolean;
  autoPayDetails?: (e: string, ey: string) => void;
  convenience_fee?: number;
  amount?: number;
  amountRequired?: boolean;
}

// ── shared header cell style ──
const stickyHeaderCellSx = {
  fontWeight: 600,
  color: '#6B7280',
  fontSize: '0.72rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  backgroundColor: '#F9FAFB',
  py: 1.5,
  whiteSpace: 'nowrap' as const,
  textAlign: 'center' as const, // ✅ center all headers
};

// const CardRow = React.memo(function CardRow({
//   row,
//   isSelected,
//   onSelect,
//   onDelete,
// }: {
//   row: CardDetails;
//   isSelected: boolean;
//   onSelect: (data: { card_token: number; id: number }) => void;
//   onDelete: (row: CardDetails) => void;
// }) {
//   const handleCheckboxChange = React.useCallback(() => {
//     onSelect({ card_token: Number(row.card_token), id: row.id });
//   }, [onSelect, row.card_token, row.id]);

//   const handleDeleteClick = React.useCallback(
//     (e: React.MouseEvent<HTMLButtonElement>) => {
//       e.stopPropagation();
//       onDelete(row);
//     },
//     [onDelete, row]
//   );

//   const isCard = !!row.card_type;
//   const decryptedNumber = decryptFunction(row.number);

//   const expiryDisplay = React.useMemo(() => {
//     if (!isCard) return '—';
//     const month = row.expiration_month;
//     const year = row.expiration_year;
//     if (month && year) {
//       const mm = String(month).padStart(2, '0');
//       const yy = String(year).length === 4 ? String(year).slice(-2) : String(year).padStart(2, '0');
//       return `${mm}/${yy}`;
//     }
//     return '—';
//   }, [isCard, row.expiration_month, row.expiration_year]);

//   return (
//     <TableRow hover key={row.id} selected={isSelected} sx={{ '&:last-child td': { borderBottom: 0 } }}>
//       {/* Payment Method — left aligned */}
//       <TableCell sx={{ py: 1.5 }}>
//         <Stack direction="row" alignItems="center" spacing={2}>
//           <Box
//             sx={{
//               width: 32,
//               height: 32,
//               borderRadius: 1,
//               bgcolor: isCard ? '#EEF2FF' : '#F8FAFC',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             {isCard ? <CreditCard size={18} color="#2563EB" /> : <Bank size={18} color="#64748B" />}
//           </Box>

//           <Box sx={{ minWidth: 120 }}>
//             <Typography fontWeight={700} fontSize="0.85rem">
//               {isCard ? row.card_type : 'Bank'}
//             </Typography>

//             {!isCard && (
//               <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
//                 {row.account_type}
//               </Typography>
//             )}
//           </Box>

//           <Typography
//             variant="body2"
//             sx={{
//               fontWeight: 500,
//               whiteSpace: 'nowrap',
//             }}
//           >
//             Last 4 digits: <strong>•••• {String(decryptedNumber).slice(-4)}</strong>
//           </Typography>
//         </Stack>
//       </TableCell>
//       <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
//         <Typography variant="body2" fontSize="0.82rem">
//           {expiryDisplay}
//         </Typography>
//       </TableCell>

//       {/* Date Added — centered */}
//       <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
//         <Typography variant="body2" fontSize="0.82rem">
//           {dayjs.tz(row.createdAt, 'America/Chicago').tz(dayjs.tz.guess()).format('MMM D, YYYY')}
//         </Typography>
//       </TableCell>

//       {/* Default — centered */}
//       <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
//         <Radio
//           checked={isSelected}
//           onChange={handleCheckboxChange}
//           size="small"
//           sx={{
//             color: '#D1D5DB',
//             p: 0.5,
//             '&.Mui-checked': { color: colors.blue },
//           }}
//         />
//         {/* <Checkbox
//           checked={isSelected}
//           onChange={handleCheckboxChange}
//           size="small"
//           sx={{
//             color: '#D1D5DB',
//             p: 0.5,
//             '&.Mui-checked': { color: colors.blue },
//           }}
//         /> */}
//       </TableCell>

//       {/* Action — centered */}
//       <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
//         <Button
//           size="small"
//           startIcon={<Trash size={14} />}
//           variant="outlined"
//           onClick={handleDeleteClick}
//           sx={{
//             color: '#374151',
//             borderColor: '#D1D5DB',
//             whiteSpace: 'nowrap',
//             fontSize: '0.78rem',
//             py: 0.5,
//             px: 1.5,
//             minWidth: 0,
//             '&:hover': {
//               borderColor: '#EF4444',
//               color: '#EF4444',
//               backgroundColor: '#FEF2F2',
//             },
//           }}
//         >
//           Remove
//         </Button>
//       </TableCell>
//     </TableRow>
//   );
// });

const CARD_TYPE_ICON_MAP: Record<string, string> = {
  VISA: 'visa.png',
  // MC: 'master-card.png',
  // MASTERCARD: 'master-card.png',
  DISC: 'discover.png',
  DISCOVER: 'discover.png',
  AMEX: 'american-express.png',
  AMERICANEXPRESS: 'american-express.png',
};

const DEFAULT_CARD_ICON = '/assets/cards/default-card.png';
const BANK_ACCOUNT_ICON = '/assets/cards/bank-account.png';

function getCardIconSrc(cardType?: string | null): string {
  if (!cardType) return BANK_ACCOUNT_ICON;

  const key = cardType.replace(/[\s-]/g, '').toUpperCase();
  const matchedFileName = CARD_TYPE_ICON_MAP[key];
  if (!matchedFileName) return DEFAULT_CARD_ICON;

  return `/assets/cards/${matchedFileName}`;
}

const dummyCardRows: CardDetails[] = [
  {
    id: 1,
    card_token: 100001,
    card_type: 'Visa',
    number: '4111111111111234',
    expiration_month: 8,
    expiration_year: 26, // valid, far out
    createdAt: '2024-01-15T10:00:00Z',
    name: '',
    type: '',
    isBank: false
  },
  {
    id: 2,
    card_token: 100002,
    card_type: 'Mastercard',
    number: '5555555555554444',
    expiration_month: 7,
    expiration_year: 26, // expiring soon (within 60 days of July 13, 2026)
    createdAt: '2024-03-10T10:00:00Z',
    name: '',
    type: '',
    isBank: false
  },
  {
    id: 3,
    card_token: 100003,
    card_type: 'Amex',
    number: '378282246310005',
    expiration_month: 5,
    expiration_year: 26, // already expired
    createdAt: '2023-11-05T10:00:00Z',
    name: '',
    type: '',
    isBank: false
  },
  {
    id: 4,
    card_token: 100004,
    card_type: 'Discover',
    number: '6011111111111117',
    expiration_month: 1,
    expiration_year: 25, // expired long ago
    createdAt: '2023-05-20T10:00:00Z',
    name: '',
    type: '',
    isBank: false
  },
  {
    id: 5,
    card_token: 100005,
    card_type: 'Visa',
    number: '4000056655665556',
    expiration_month: 12,
    expiration_year: 27, // valid, well in the future
    createdAt: '2024-06-01T10:00:00Z',
    name: '',
    type: '',
    isBank: false
  },
  {
    id: 6,
    card_token: 0,
    card_type: '', // bank account — no card_type
    account_type: 'Checking',
    number: '000123456789',
    expiration_month: null,
    expiration_year: null, // banks have no expiry
    createdAt: '2024-02-14T10:00:00Z',
    name: '',
    type: '',
    isBank: false
  },
  {
    id: 7,
    card_token: 100007,
    card_type: 'Visa',
    number: '4242424242424242',
    expiration_month: 9,
    expiration_year: 2026, // 4-digit year variant, tests your padStart/slice logic
    createdAt: '2024-04-18T10:00:00Z',
    name: '',
    type: '',
    isBank: false
  },
];

const CardRow = React.memo(function CardRow({
  row,
  isSelected,
  onSelect,
  onDelete,
}: {
  row: CardDetails;
  isSelected: boolean;
  onSelect: (data: { card_token: number; id: number }) => void;
  onDelete: (row: CardDetails) => void;
}) {
  const isCard = !!row.card_type;
  const decryptedNumber = decryptFunction(row.number);
  const last4 = String(decryptedNumber).slice(-4);
  const iconSrc = getCardIconSrc(row.card_type);
  const selectedCardInfo = useSelector(
    (state: RootState) => state.Account.selectedCardInfo
  );

  const expiryDisplay = React.useMemo(() => {
    if (!isCard) return '';
    const month = row.expiration_month;
    const year = row.expiration_year;
    if (month && year) {
      const mm = String(month).padStart(2, '0');
      const yy = String(year).length === 4 ? String(year).slice(-2) : String(year).padStart(2, '0');
      return `${mm}/${yy}`;
    }
    return '—';
  }, [isCard, row.expiration_month, row.expiration_year]);


  const expiryStatus = React.useMemo<'expired' | 'expiring' | 'ok' | null>(() => {
    if (!isCard) return null;
    const month = row.expiration_month;
    const year = row.expiration_year;
    if (!month || !year) return null;

    const fullYear = String(year).length === 2 ? Number(`20${year}`) : Number(year);
    const expiryDate = dayjs(`${fullYear}-${String(month).padStart(2, '0')}-01`).endOf('month');
    const now = dayjs();

    if (expiryDate.isBefore(now, 'day')) return 'expired';
    if (expiryDate.diff(now, 'day') <= 60) return 'expiring';
    return 'ok';
  }, [isCard, row.expiration_month, row.expiration_year]);

  const isExpired = expiryStatus === 'expired';
  const isExpiring = expiryStatus === 'expiring';

  const handleCheckboxChange = React.useCallback(() => {
    if (isExpired) return;
    onSelect({ card_token: (row.card_token), id: row.id });
  }, [onSelect, row.card_token, row.id, isExpired]);

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onDelete(row);
    },
    [onDelete, row]
  );

  // ---- Color tokens (status-driven) ----
  const rowBg = isExpired ? '#FEF2F2' : isExpiring ? '#FFFBEB' : isSelected ? '#EFF6FF' : 'transparent';
  const rowHoverBg = isExpired ? '#FEF2F2' : isExpiring ? '#FFF7E0' : '#F8FAFC';
  const leftBorderColor = isExpired ? '#DC2626' : isExpiring ? '#D97706' : 'transparent';
  const statusTextColor = isExpired ? '#B91C1C' : isExpiring ? '#B45309' : 'text.primary';
  const statusChipBg = isExpired ? '#FEE2E2' : '#FEF3C7';
  const statusChipColor = isExpired ? '#B91C1C' : '#92400E';

  return (
    <TableRow
      hover={!isExpired}
      key={row.id}
      selected={isSelected}
      onClick={handleCheckboxChange}
      sx={{
        '&:last-child td': { borderBottom: 0 },
        bgcolor: rowBg,
        borderLeft: '3px solid',
        borderLeftColor: leftBorderColor,
        cursor: isExpired ? "not-allowed" : "pointer",
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: rowHoverBg,
        },
        '&.Mui-selected': {
          bgcolor: isExpiring ? '#FFFBEB' : '#EFF6FF',
        },
        '&.Mui-selected:hover': {
          bgcolor: isExpiring ? '#FFF7E0' : '#E0EDFF',
        },
        // '@media (max-width:600px)': {
        //   paddingX: 3,
        // },
      }}
    >
      <TableCell
        sx={{
          display: { xs: 'table-cell', sm: 'none' },
          py: 1,
          px: 1,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} >
          <Radio
            checked={isSelected && !isExpired}
            disabled={isExpired}
            size="small"
            sx={{
              color: '#CBD5E1',
              py: 0.5,
              flexShrink: 0,
              '& svg': { width: 14, height: 14 },
            }}
          />

          <Box
            sx={{
              width: 50,
              height: 36,
              borderRadius: 0.3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              filter: isExpired ? 'grayscale(70%)' : 'none',
              opacity: isExpired ? 0.6 : 1,
            }}
          >
            <img
              src={iconSrc}
              alt={isCard ? row.card_type : 'Bank Account'}
              style={{ maxWidth: '80%', width: 'auto', height: '90%', objectFit: 'contain' }}
              onError={(e) => {
                const fallback = isCard ? DEFAULT_CARD_ICON : BANK_ACCOUNT_ICON;
                if (e.currentTarget.src.indexOf(fallback) === -1) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography
              fontWeight={700}
              sx={{
                fontSize: '0.72rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: isExpired ? '#6B7280' : 'text.primary',
              }}
            >
              {isCard ? row.card_type : 'Bank'} •••• {last4}
            </Typography>

            {!isCard && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
                {row.account_type}
              </Typography>
            )}

            {expiryDisplay && (
              <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    color: isExpired || isExpiring ? statusTextColor : 'text.secondary',
                    fontWeight: isExpired || isExpiring ? 600 : 400,
                  }}
                >
                  {expiryDisplay}
                </Typography>

                <Typography sx={{ fontSize: '0.62rem', color: 'text.secondary', lineHeight: "0.6rem" }}>
                  ({dayjs.tz(row.createdAt, 'America/Chicago').tz(dayjs.tz.guess()).format('MMM D, YYYY')})
                </Typography>

                {(isExpired || isExpiring) && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.58rem',
                      fontWeight: 600,
                      lineHeight: 1,
                      px: 0.75,
                      py: 0.4,
                      borderRadius: '999px',
                      bgcolor: statusChipBg,
                      color: statusChipColor,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isExpired ? 'Expired' : 'Expiring'}
                  </Box>
                )}


              </Stack>
            )}

          </Box>

          <Button
            size="small"
            onClick={handleDeleteClick}
            sx={{
              minWidth: 0,
              width: 32,
              height: 32,
              p: 0,
              flexShrink: 0,
              borderRadius: 1.5,
              color: '#4B5563',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#FCA5A5',
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
              },
            }}
          >
            <Trash size={14} />
          </Button>
        </Stack>
      </TableCell>

      {/* Default — centered */}
      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, py: { xs: 0.75, sm: 1.5 }, px: { xs: 0.5, sm: 2 }, textAlign: 'center' }}>
        <Radio
          checked={isSelected && !isExpired}
          // onChange={handleCheckboxChange}
          disabled={isExpired}
          size="small"
          sx={{
            color: '#CBD5E1',
            p: 0.5,
            '& svg': {
              width: { xs: 14, sm: 20 },
              height: { xs: 14, sm: 20 },
            },
          }}
        />
      </TableCell>

      {/* Payment Method — left aligned, image-style layout */}
      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, py: { xs: 1, sm: 2 }, px: { xs: 0.75, sm: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
          <Box
            sx={{
              width: { xs: 50, sm: 60, md: 80 },
              height: { xs: 36, sm: 36, md: 44 },
              borderRadius: { xs: .3, sm: 1 },
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              filter: isExpired ? 'grayscale(70%)' : 'none',
              opacity: isExpired ? 0.6 : 1,
            }}
          >
            <img
              src={iconSrc}
              alt={isCard ? row.card_type : 'Bank Account'}
              style={{ maxWidth: '80%', width: 'auto', height: '90%', objectFit: 'contain' }}
              onError={(e) => {
                const fallback = isCard ? DEFAULT_CARD_ICON : BANK_ACCOUNT_ICON;
                if (e.currentTarget.src.indexOf(fallback) === -1) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.25 }}>
            <Typography
              fontWeight={700}
              sx={{
                fontSize: { xs: '0.72rem', sm: '0.85rem', md: '0.9rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: isExpired ? '#6B7280' : 'text.primary',
              }}
            >
              {isCard ? row.card_type : 'Bank'} •••• {last4}
            </Typography>

            {!isCard && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontSize: { xs: '0.62rem', sm: '0.75rem' } }}
              >
                {row.account_type}
              </Typography>
            )}

            {expiryDisplay && (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography
                  sx={{
                    fontSize: { xs: '0.65rem', sm: '0.78rem', md: '0.82rem' },
                    color: isExpired || isExpiring ? statusTextColor : 'text.secondary',
                    fontWeight: isExpired || isExpiring ? 600 : 400,
                  }}
                >
                  {expiryDisplay}
                </Typography>

                {(isExpired || isExpiring) && (
                  <Box
                    component="span"
                    sx={{
                      fontSize: { xs: '0.58rem', sm: '0.65rem' },
                      fontWeight: 600,
                      lineHeight: 1,
                      px: 0.75,
                      py: 0.4,
                      borderRadius: '999px',
                      bgcolor: statusChipBg,
                      color: statusChipColor,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isExpired ? 'Expired' : 'Expiring soon'}
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </TableCell>

      {/* Date Added — centered */}
      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, py: { xs: 0.75, sm: 1.5 }, px: { xs: 0.5, sm: 2 }, textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: { xs: '0.68rem', sm: '0.78rem', md: '0.82rem' },
            whiteSpace: 'nowrap',
            color: 'text.secondary',
          }}
        >
          {dayjs.tz(row.createdAt, 'America/Chicago').tz(dayjs.tz.guess()).format('MMM D, YYYY')}
        </Typography>
      </TableCell>

      {/* Action — centered */}
      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, py: { xs: 0.75, sm: 1.5 }, px: { xs: 0.5, sm: 2 }, textAlign: 'center' }}>
        <Button
          size="small"
          startIcon={<Trash size={14} style={{ margin: 0, width: 'fit-content' }} />}
          variant="outlined"
          onClick={handleDeleteClick}
          sx={{
            color: '#4B5563',
            borderColor: '#E2E8F0',
            bgcolor: '#FFFFFF',
            whiteSpace: 'nowrap',
            fontSize: { xs: '0.68rem', sm: '0.78rem' },
            py: 0.5,
            px: { xs: 0.75, sm: 1.5 },
            maxWidth: 'fit-content',
            minWidth: 0,
            borderRadius: 1.5,
            textTransform: 'none',
            '& .MuiButton-startIcon': { mr: { xs: 0, sm: .5 } },
            transition: 'all 0.15s ease',
            '&:hover': {
              borderColor: '#FCA5A5',
              color: '#DC2626',
              backgroundColor: '#FEF2F2',
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Remove
          </Box>
        </Button>
      </TableCell>
    </TableRow>
  );
});

function PaymentMethodSummary({ details }: { details: CardDetails }) {
  const isCard = !!details.card_type;
  const decryptedNumber = decryptFunction(details.number);
  const last4 = String(decryptedNumber).slice(-4);
  const iconSrc = getCardIconSrc(details.card_type);


  const expiryDisplay = React.useMemo(() => {
    if (!isCard) return '';
    const month = details.expiration_month;
    const year = details.expiration_year;
    if (month && year) {
      const mm = String(month).padStart(2, '0');
      const yy = String(year).length === 4 ? String(year).slice(-2) : String(year).padStart(2, '0');
      return `${mm}/${yy}`;
    }
    return '';
  }, [isCard, details.expiration_month, details.expiration_year]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: '1px solid #E2E8F0',
        bgcolor: '#F8FAFC',
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 34,
          borderRadius: 1,
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src={iconSrc}
          alt={isCard ? details.card_type : 'Bank Account'}
          style={{ maxWidth: '80%', width: 'auto', height: '80%', objectFit: 'contain' }}
          onError={(e) => {
            const fallback = isCard ? DEFAULT_CARD_ICON : BANK_ACCOUNT_ICON;
            if (e.currentTarget.src.indexOf(fallback) === -1) {
              e.currentTarget.src = fallback;
            }
          }}
        />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={700} sx={{ fontSize: '0.85rem' }}>
          {isCard ? details.card_type : 'Bank'} •••• {last4}
        </Typography>
        {!isCard && details.account_type && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {details.account_type}
          </Typography>
        )}
        {expiryDisplay && (
          <Typography sx={{ fontSize: '0.78rem' }} color="text.secondary">
            Expires {expiryDisplay}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

const HeaderComp = ({
  anchorEl,
  setAnchorEl,
  openPopover,
  setCardModalOpen,
  setBankModalOpen,
  onClose,
  isModal
}: {
  anchorEl: HTMLButtonElement | null;
  setAnchorEl: (anchorEl: HTMLButtonElement | null) => void;
  openPopover: boolean;
  setCardModalOpen: (openModal: boolean) => void;
  setBankModalOpen: (openModal: boolean) => void;
  isModal: boolean;
  onClose: () => void;
}) => {
  return (
    <Box sx={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "end", p: { xs: 1.5, sm: 2 }, pb: { xs: 0, sm: 2 }, gap: { xs: 1, sm: 2 }, }}>
      <Box>
        <Typography variant="h5" sx={{
          '@media (max-width:600px)': {
            fontSize: "1.2rem",
          },
        }}>
          Payment Methods
        </Typography>

        <Typography
          variant="h6"
          fontWeight={400}
          fontSize={16}
          sx={{
            '@media (max-width:600px)': {
              fontSize: "0.9rem",
            },
          }}
        >
          Manage your saved payment methods. The default method is your preferred payment method
        </Typography>

      </Box>

      <Box ml={"auto"} >
        <Button
          variant='outlined'
          size='small'
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
          sx={{
            color: colors.white,
            borderColor: colors.blue,
            background: colors.blue,
            "&:hover": {
              backgroundColor: colors.blue,
              borderColor: colors.blue,
              opacity: 0.85, // adjust as needed (0.8 - 0.95)
            },
            '@media (max-width:600px)': {
              paddingX: 2,
              paddingY: 0.5,
              fontSize: "0.7rem",
              marginBottom: 1
            },
          }}
          startIcon={
            <Box
              sx={{
                display: 'flex',
                '& svg': {
                  width: { xs: 10, md: 14 },
                  height: { xs: 10, md: 14 },
                },
              }}
            >
              <Plus weight="bold" />
            </Box>
          }
        >
          {/* <Plus size={{ xs: 14, md: 16 }} weight="bold" /> */}
          Add a payment method
        </Button>

        {/* Dropdown Popover */}
        <Popover
          open={openPopover}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
            <Button
              onClick={() => {
                setAnchorEl(null);
                setCardModalOpen(true);
              }}
              startIcon={<CreditCard size={16} />}
              sx={{
                justifyContent: 'flex-start',
                px: 2,
                py: 1.2,
                color: '#374151',
                borderRadius: 0,
                '&:hover': { backgroundColor: '#F3F4F6' },
              }}
            >
              New Card
            </Button>
            <Divider />
            <Button
              onClick={() => {
                setAnchorEl(null);
                setBankModalOpen(true);
              }}
              startIcon={<Bank size={16} />}
              sx={{
                justifyContent: 'flex-start',
                px: 2,
                py: 1.2,
                color: '#374151',
                borderRadius: 0,
                '&:hover': { backgroundColor: '#F3F4F6' },
              }}
            >
              New Bank Account
            </Button>
          </Box>
        </Popover>
      </Box>

      {isModal && (
        <IconButton onClick={onClose} size="small" sx={{ position: "absolute", right: { xs: 5, sm: 8 }, padding: "3px", top: { xs: 8, sm: 10 } }}>
          <X size={20} color={colors.blue} />
        </IconButton>
      )}
    </Box >
  )
}


export const PaymentMethods = ({
  isModal = false,
  onClose,
  onSaveCardDetails,
  autoPayDetails,
  paymentDetailsPage = false,
}: CustomersTableProps): React.JSX.Element => {
  console.log('autoPayDetails', autoPayDetails);

  const { setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    if (!paymentDetailsPage) setContextLoading(true);
  }, []);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const openPopover = Boolean(anchorEl);
  const dispatch = useDispatch();
  const { accountLoading, paymentMethodInfoCards } = useSelector((state: RootState) => state?.Account);
  const [selectedId, setSelectedId] = React.useState<{ card_token: number; id: number } | null>(null);
  const [cardModalOpen, setCardModalOpen] = React.useState(false);
  const [bankModalOpen, setBankModalOpen] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [deleCardDetails, setDeleteCardDetails] = React.useState<CardDetails | null>(null);
  const selectedCardInfo = useSelector(
    (state: RootState) => state.Account.selectedCardInfo
  );
  const [selectedCard, setSelectedCard] = React.useState<PaymentCard | CardDetails | null>(null);

  React.useEffect(() => {
    if (selectedCardInfo) {
      setSelectedCard(selectedCardInfo);
      setSelectedId({
        id: selectedCardInfo.id,
        card_token: Number(selectedCardInfo.card_token),
      });
    }
  }, [selectedCardInfo]);

  type IntuityUser = {
    body?: { acl_role_id?: string; customer_id?: string; token?: string };
  };
  const isPaymentMethodsPage = location.pathname.includes("payment-methods");

  const stored = React.useMemo(() => {
    const raw = getLocalStorage('intuity-user');
    return typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;
  }, []);

  React.useEffect(() => {
    const formdata = new FormData();
    formdata.append('acl_role_id', stored?.body?.acl_role_id);
    formdata.append('customer_id', stored?.body?.customer_id);
    if (!paymentDetailsPage) {
      dispatch(getPaymentDetails(formdata, undefined, undefined, setContextLoading));
    }
  }, [dispatch]);

  const myCards = React.useMemo(() => {
    if (!paymentMethodInfoCards) return [];
    return Object.keys(paymentMethodInfoCards).map((key) => {
      const card = paymentMethodInfoCards[key];
      return {
        name: card?.account_type ? card.account_type : card.card_type ?? '_',
        number:
          card?.bank_account_number && card?.bank_account_number !== 'undefined'
            ? card.bank_account_number
            : card.card_number ?? '_',
        type: card?.card_type ? 'card' : 'Account',
        createdAt: card.date_used,
        id: card.id,
        card_type: card.card_type,
        card_token: card.card_token,
        account_type: card.account_type,
        expiration_month: card.expiration_month,
        expiration_year: card.expiration_year,
        isBank: card?.card_type ? false : true,
      };
    });
  }, [paymentMethodInfoCards]);


  const selectOne = React.useCallback((data: { card_token: number; id: number }) => {
    setSelectedId((prev) => (prev?.id === data.id ? null : data));
  }, []);

  const handleDelete = React.useCallback((row: CardDetails) => {
    setOpenConfirm(true);
    setDeleteCardDetails(row);
  }, []);

  const handleConfirm = React.useCallback(() => {
    const formData = new FormData();
    formData.append('acl_role_id', stored?.body?.acl_role_id);
    formData.append('customer_id', stored?.body?.customer_id);
    formData.append('id', deleCardDetails?.id?.toString() || '');
    formData.append('payment_method', '1');
    formData.append('customerid', stored?.body?.customer_id);

    dispatch(
      deleteCardAndBankAccount(formData, deleCardDetails?.card_type ? 'card' : 'bank_account', () => {
        setOpenConfirm(false);
        const refreshForm = new FormData();
        refreshForm.append('acl_role_id', stored?.body?.acl_role_id);
        refreshForm.append('customer_id', stored?.body?.customer_id);
        dispatch(getPaymentDetails(refreshForm));
      })
    );
  }, [deleCardDetails, dispatch]);

  const handleSaveDetails = () => {
    const selectedCardDetails = Object.keys(paymentMethodInfoCards).filter(
      (key) => paymentMethodInfoCards[key].card_token == selectedId?.card_token
    )[0];
    if (onSaveCardDetails) {
      onSaveCardDetails(paymentMethodInfoCards[selectedCardDetails]);
      return;
    }
    if (autoPayDetails) {
      autoPayDetails(paymentMethodInfoCards[selectedCardDetails], String(selectedId?.card_token));
      return;
    }
    const formdata = new FormData();
    formdata.append('acl_role_id', stored?.body?.acl_role_id);
    formdata.append('customer_id', stored?.body?.customer_id);
    formdata.append('model_open', '2');
    formdata.append('payment_method', String(selectedId?.card_token));
    dispatch(getPaymentDetails(formdata, true, () => setSelectedId(null)));
  };

  const dashBoardInfo = useSelector((state: RootState) => state?.DashBoard?.dashBoardInfo);
  const CustomerInfo: CustomerInfo = dashBoardInfo?.customer
    ? dashBoardInfo?.customer
    : getLocalStorage('intuity-customerInfo');

  React.useEffect(() => {
    if (CustomerInfo?.company_id) {
      const formdata = new FormData();
      formdata.append('acl_role_id', stored?.body?.acl_role_id);
      formdata.append('company_id', CustomerInfo?.company_id);
      dispatch(
        getPaymentProcessorDetails(formdata, false, undefined, () => {
          if (paymentDetailsPage) setContextLoading(false);
        })
      );
    }
  }, [CustomerInfo]);

  const memoizedCardRows = React.useMemo(
    () =>
      myCards.map((row) => (
        <CardRow
          key={row.id}
          row={row}
          // isSelected={selectedId?.id === row.id}
          isSelected={selectedCard?.id === row.id}
          // onSelect={selectOne}
          onSelect={(data) => {
            setSelectedId(data);

            const card = myCards.find((item) => item.id === data.id);
            if (card) {
              setSelectedCard(card);
            }
          }}
          onDelete={handleDelete}
        />
      )),
    [myCards, selectedId, selectedCard, handleDelete]
  );

  const isDeletingPrimaryCard =
    !!selectedCardInfo && deleCardDetails?.id === selectedCardInfo.id;

  return (
    <SkeletonWrapper>
      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          bgcolor: "#fff",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── Header ── */}
        <Box sx={{ display: isModal ? "none" : { xs: "none", sm: "block" } }}>
          <HeaderComp
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            openPopover={openPopover}
            setCardModalOpen={setCardModalOpen}
            setBankModalOpen={setBankModalOpen}
            isModal={isModal}
            onClose={onClose}
          />
          <Divider />
        </Box>

        <Box sx={{ width: isModal ? "100%" : { xs: "95%", md: "60%" }, mx: 'auto', my: isModal ? 0 : { xs: "8px", sm: '24px' } }}>
          <Card
            sx={{
              borderRadius: boarderRadius.card,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              width: "100%"
            }}
          >
            {/* ── Header ── */}
            <Box sx={{ display: isModal ? "block" : { xs: "block", sm: "none" } }}>
              <HeaderComp
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                openPopover={openPopover}
                setCardModalOpen={setCardModalOpen}
                setBankModalOpen={setBankModalOpen}
                isModal={isModal}
                onClose={onClose}
              />
              <Divider />
            </Box>


            {/* ── Table ── */}
            <Box
              sx={{
                width: '100%',
                overflowX: 'auto', // safety net only — sizing below is tuned to avoid needing it
                overflowY: 'auto',
                maxHeight: {
                  xs: isModal ? "60vh" : "50vh",
                  sm: isModal ? 'calc(80vh - 220px)' : '520px'
                },
                flex: 1,
              }}
            >
              <Table stickyHeader size="small" sx={{ tableLayout: 'auto', width: '100%' }}>
                <TableHead sx={{ display: { xs: "none", sm: "table-header-group" } }}>
                  <TableRow>
                    <TableCell sx={{ ...stickyHeaderCellSx, px: { xs: 0.5, sm: 2 } }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                        <Tooltip
                          title="We'll make this your default payment method for your future utility payments."
                          placement="top"
                          arrow
                          enterTouchDelay={0}
                          leaveTouchDelay={3000}
                          componentsProps={{ tooltip: { sx: tooltipSx } }}
                        >
                          <IconButton size="small" sx={{ p: 0.2 }}>
                            <Question size={16} color="#90caf9" weight="fill" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    <TableCell
                      sx={{
                        ...stickyHeaderCellSx,
                        textAlign: 'left',
                        px: { xs: 0.75, sm: 2 },
                        fontSize: { xs: '0.72rem', sm: '0.85rem' },
                      }}
                    >
                      Payment Method
                    </TableCell>

                    <TableCell
                      sx={{
                        ...stickyHeaderCellSx,
                        px: { xs: 0.5, sm: 2 },
                        fontSize: { xs: '0.68rem', sm: '0.85rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Date Added
                    </TableCell>

                    <TableCell
                      sx={{
                        ...stickyHeaderCellSx,
                        px: { xs: 0.5, sm: 2 },
                        fontSize: { xs: '0.68rem', sm: '0.85rem' },
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {myCards?.length > 0 ? (
                    memoizedCardRows
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No payment methods found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Divider />

            {/* ── Footer ── */}
            <Box sx={{ px: { xs: 1.3, sm: 3 }, py: { xs: 0.5, sm: 1.5 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary" fontStyle="italic" fontSize="0.75rem">
                  {/* If credit card expires, or you need to edit a payment method, please select Remove then add your card.   {isPaymentMethodsPage */}
                  {isPaymentMethodsPage ? "If card expires, or you need to edit a payment method, please select Remove then add your card."
                    : "If credit card expires, or you need to edit a payment method, please select Remove then add your card."}              </Typography>

              </Stack>
            </Box>
            <Grid item>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => setSelectedCard(selectedCardInfo)}
                  variant="outlined"
                  disabled={selectedCard?.id === selectedCardInfo?.id}
                  size="small"
                  sx={{
                    color: colors.blue,
                    borderColor: colors.blue,
                    borderRadius:1.2,
                    '@media (max-width:600px)': {
                      paddingX: 1,
                      paddingY: 0.3,
                      fontSize: "0.8rem"
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDetails}
                  variant="contained"
                  disabled={selectedCard?.id === selectedCardInfo?.id}
                  size='small'
                  sx={{
                    backgroundColor: colors.blue,
                    borderRadius:1,
                    '&:hover': { backgroundColor: colors['blue.3'] },
                    '@media (max-width:600px)': {
                      paddingX: 1,
                      paddingY: 0.3,
                      fontSize: "0.8rem"
                    },
                  }}
                >
                  Save details
                </Button>
              </CardActions>
            </Grid>

            {/* ── Modals ── */}
            {cardModalOpen && (
              <AddCardModal
                open={cardModalOpen}
                onClose={() => setCardModalOpen(false)}
                onSuccess={() => setCardModalOpen(false)}
              />
            )}
            {bankModalOpen && <AddBankAccountModal open={bankModalOpen} onClose={() => setBankModalOpen(false)} />}
            {/* 
            <ConfirmDialog
              open={openConfirm}
              title={deleCardDetails?.card_type ? 'Card' : 'Bank Account'}
              // message={`Are you sure want to Delete this ${deleCardDetails?.card_type ? 'Card' : 'Bank Account'}?`
              // }

              message={
                `Are you sure you want to delete this ${deleCardDetails?.card_type ? "Card" : "Bank Account"
                }?` +
                (isDeletingPrimaryCard
                  ? "\n\nWarning: You are removing your Primary payment method. No Primary payment method will be assigned after this payment method is removed."
                  : "")
              }
              details={deleCardDetails ? <PaymentMethodSummary details={deleCardDetails} /> : undefined}

              confirmLabel="Yes, Confirm"
              cancelLabel="Cancel"
              onConfirm={handleConfirm}
              onCancel={() => (setOpenConfirm(false))}
              loader={accountLoading}
            /> */}

            <RemovePaymentMethodDialog
              open={openConfirm}
              details={deleCardDetails}
              isPrimary={isDeletingPrimaryCard}
              onConfirm={handleConfirm}
              onCancel={() => setOpenConfirm(false)}
              loader={accountLoading}
            />

            <CustomBackdrop open={accountLoading} style={{ zIndex: 1300, color: '#fff' }}>
              <Loader />
            </CustomBackdrop>
          </Card>
        </Box>
      </Box>

    </SkeletonWrapper >
  );
};
