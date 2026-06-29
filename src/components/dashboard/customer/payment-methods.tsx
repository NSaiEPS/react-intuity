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
  const handleCheckboxChange = React.useCallback(() => {
    onSelect({ card_token: Number(row.card_token), id: row.id });
  }, [onSelect, row.card_token, row.id]);

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onDelete(row);
    },
    [onDelete, row]
  );

  const isCard = !!row.card_type;
  const decryptedNumber = decryptFunction(row.number);

  const expiryDisplay = React.useMemo(() => {
    if (!isCard) return '—';
    const month = row.expiration_month;
    const year = row.expiration_year;
    if (month && year) {
      const mm = String(month).padStart(2, '0');
      const yy = String(year).length === 4 ? String(year).slice(-2) : String(year).padStart(2, '0');
      return `${mm}/${yy}`;
    }
    return '—';
  }, [isCard, row.expiration_month, row.expiration_year]);

  return (
    <TableRow hover key={row.id} selected={isSelected} sx={{ '&:last-child td': { borderBottom: 0 } }}>
      {/* Payment Method — left aligned */}
      <TableCell sx={{ py: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: isCard ? '#EEF2FF' : '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isCard ? <CreditCard size={18} color="#2563EB" /> : <Bank size={18} color="#64748B" />}
          </Box>

          <Box sx={{ minWidth: 120 }}>
            <Typography fontWeight={700} fontSize="0.85rem">
              {isCard ? row.card_type : 'Bank'}
            </Typography>

            {!isCard && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {row.account_type}
              </Typography>
            )}
          </Box>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            Last 4 digits: <strong>•••• {String(decryptedNumber).slice(-4)}</strong>
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
        <Typography variant="body2" fontSize="0.82rem">
          {expiryDisplay}
        </Typography>
      </TableCell>

      {/* Date Added — centered */}
      <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
        <Typography variant="body2" fontSize="0.82rem">
          {dayjs.tz(row.createdAt, 'America/Chicago').tz(dayjs.tz.guess()).format('MMM D, YYYY')}
        </Typography>
      </TableCell>

      {/* Default — centered */}
      <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
        <Radio
          checked={isSelected}
          onChange={handleCheckboxChange}
          size="small"
          sx={{
            color: '#D1D5DB',
            p: 0.5,
            '&.Mui-checked': { color: colors.blue },
          }}
        />
        {/* <Checkbox
          checked={isSelected}
          onChange={handleCheckboxChange}
          size="small"
          sx={{
            color: '#D1D5DB',
            p: 0.5,
            '&.Mui-checked': { color: colors.blue },
          }}
        /> */}
      </TableCell>

      {/* Action — centered */}
      <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
        <Button
          size="small"
          startIcon={<Trash size={14} />}
          variant="outlined"
          onClick={handleDeleteClick}
          sx={{
            color: '#374151',
            borderColor: '#D1D5DB',
            whiteSpace: 'nowrap',
            fontSize: '0.78rem',
            py: 0.5,
            px: 1.5,
            minWidth: 0,
            '&:hover': {
              borderColor: '#EF4444',
              color: '#EF4444',
              backgroundColor: '#FEF2F2',
            },
          }}
        >
          Remove
        </Button>
      </TableCell>
    </TableRow>
  );
});

export const PaymentMethods = ({
  isModal = false,
  onClose,
  onSaveCardDetails,
  autoPayDetails,
  paymentDetailsPage = false,
}: CustomersTableProps): React.JSX.Element => {
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
  const [removeSaveDetails, setRemoveSaveDetails] = React.useState(false);
  const [deleCardDetails, setDeleteCardDetails] = React.useState<CardDetails | null>(null);

  type IntuityUser = {
    body?: { acl_role_id?: string; customer_id?: string; token?: string };
  };

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
          isSelected={selectedId?.id === row.id}
          onSelect={selectOne}
          onDelete={handleDelete}
        />
      )),
    [myCards, selectedId, selectOne, handleDelete]
  );
  // console.log(memoizedCardRows, 'memoizedCardRows');
  return (
    <SkeletonWrapper>
      <Box sx={{ maxWidth: isModal ? '100%' : '70%', mx: 'auto' }}>
        <Card
          sx={{
            borderRadius: boarderRadius.card,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ── Header ── */}
          <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight={700} fontSize="1.05rem" color={colors.blue}>
                  Payment Methods
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.4} fontSize="0.82rem">
                  Manage your saved payment methods. The default method is your preferred payment method
                </Typography>
              </Box>
              {isModal && (
                <IconButton onClick={onClose} size="small" sx={{ mt: -0.5 }}>
                  <X size={20} color={colors.blue} />
                </IconButton>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* ── Table ── */}
          <Box
            sx={{
              overflowX: 'auto',
              overflowY: 'auto',
              maxHeight: isModal ? 'calc(90vh - 220px)' : '520px',
              flex: 1,
            }}
          >
            <Table stickyHeader size="small" sx={{ tableLayout: 'auto', width: '100%' }}>
              <TableHead>
                <TableRow>
                  {/* Payment Method header — left aligned only */}
                  <TableCell sx={{ ...stickyHeaderCellSx, textAlign: 'left' }}>Payment Method</TableCell>
                  <TableCell sx={{ ...stickyHeaderCellSx }}>Expires</TableCell>
                  <TableCell sx={{ ...stickyHeaderCellSx }}>Date Added</TableCell>
                  <TableCell sx={{ ...stickyHeaderCellSx }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={0.5}
                      sx={{
                        marginLeft: '20px',
                      }}
                    >
                      <span>Default</span>
                      <Tooltip
                        title="We'll make this your default payment method for your future utility payments."
                        placement="top"
                        arrow
                        enterTouchDelay={0}
                        leaveTouchDelay={3000}
                        // componentsProps={{ tooltip: { sx: tooltipSx } }}
                      >
                        <IconButton size="small" sx={{ p: 0.2 }}>
                          <Question size={16} color="#90caf9" weight="fill" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ ...stickyHeaderCellSx }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myCards?.length > 0 ? (
                  memoizedCardRows
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No payment methods found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <Divider />

          {/* ── Footer ── */}
          <Box sx={{ px: 3, py: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary" fontStyle="italic" fontSize="0.75rem">
                If card expires, or you need to edit a payment method, please select Remove then add your card.
              </Typography>
              {/* Add a payment method with popover */}
              <Box>
                <Link
                  component="button"
                  underline="none"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
                  sx={{
                    color: colors.blue,
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  <Plus size={14} weight="bold" />
                  Add a payment method
                </Link>

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
            </Stack>
          </Box>
          {/* <Grid item>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setRemoveSaveDetails(true)}
                variant="outlined"
                disabled={!selectedId}
                sx={{ color: colors.blue, borderColor: colors.blue }}

                // sx={{
                //   backgroundColor: colors.blue,
                //   '&:hover': { backgroundColor: colors['blue.3'] },
                // }}
              >
                Remove
              </Button>
              <Button
                onClick={handleSaveDetails}
                variant="contained"
                disabled={!selectedId}
                sx={{
                  backgroundColor: colors.blue,
                  '&:hover': { backgroundColor: colors['blue.3'] },
                }}
              >
                Save details
              </Button>
            </CardActions>
          </Grid> */}

          {/* ── Modals ── */}
          {cardModalOpen && (
            <AddCardModal
              open={cardModalOpen}
              onClose={() => setCardModalOpen(false)}
              onSuccess={() => setCardModalOpen(false)}
            />
          )}
          {bankModalOpen && <AddBankAccountModal open={bankModalOpen} onClose={() => setBankModalOpen(false)} />}

          <ConfirmDialog
            open={openConfirm || removeSaveDetails}
            title={removeSaveDetails ? 'Warning' : deleCardDetails?.card_type ? 'Card' : 'Bank Account'}
            message={
              removeSaveDetails
                ? ' You are removing your Primary payment method. No Primary payment method will be assigned after this payment method is removed.'
                : `Are you sure want to Delete this ${deleCardDetails?.card_type ? 'Card' : 'Bank Account'}?`
            }
            confirmLabel="Yes, Confirm"
            cancelLabel="Cancel"
            onConfirm={() => {
              if (removeSaveDetails) {
                setSelectedId(null);
                setRemoveSaveDetails(false);
              } else {
                handleConfirm();
              }
            }}
            onCancel={() => (removeSaveDetails ? setRemoveSaveDetails(false) : setOpenConfirm(false))}
            loader={accountLoading}
          />

          <CustomBackdrop open={accountLoading} style={{ zIndex: 1300, color: '#fff' }}>
            <Loader />
          </CustomBackdrop>
        </Card>
      </Box>
    </SkeletonWrapper>
  );
};
