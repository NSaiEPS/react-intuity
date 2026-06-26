import * as React from "react";
import {
  deleteCardAndBankAccount,
  getPaymentDetails,
  getPaymentProcessorDetails,
} from "@/state/features/accountSlice";
import { RootState } from "@/state/store";
import {
  boarderRadius,
  colors,
  CustomerInfo,
  decryptFunction,
} from "@/utils";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  Button,
  Card,
  CardActions,
  DialogActions,
  Divider,
  Grid,
  Radio,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Trash, X } from "@phosphor-icons/react";
import { CustomBackdrop, Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "@/hooks/redux";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";

import AddBankAccountModal from "./add-bank-modal";
import AddCardModal from "./add-card-modal";
import { useLoading } from "@/components/core/skeleton-context";
import Header from "@/components/CommonComponents/header";
dayjs.extend(utc);
dayjs.extend(timezone);
export interface CardDetails {
  name: string;
  number: string;
  type: string;
  createdAt: string;
  id: number;
  card_token: number;

  card_type?: string;
  bank_account_number?: string;
  account_type?: string;
  date_used?: string;
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
  const handleRadioChange = React.useCallback(() => {
    onSelect({
      card_token: Number(row.card_token),
      id: row.id,
    });
  }, [onSelect, row.card_token]);

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onDelete(row);
    },
    [onDelete, row]
  );
  return (
    <TableRow hover key={row.id} selected={isSelected}>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Radio
            checked={isSelected}
            onChange={handleRadioChange}
            value={row.id}
          />
          <Typography variant="subtitle2">{row.name}</Typography>
        </Stack>
      </TableCell>
      <TableCell
        sx={{
          fontFamily: "monospace", // ensures * and numbers align perfectly
        }}
      >
        {decryptFunction(row.number)}
        {/* {cardNumber} */}
      </TableCell>
      <TableCell>{row.type}</TableCell>
      {/* <TableCell>{formatToMMDDYYYY(row.createdAt, true)}</TableCell> */}
      <TableCell>
        {dayjs
          .tz(row.createdAt, "America/Chicago") // or whichever US timezone server uses
          .tz(dayjs.tz.guess()) // convert to user's local time
          .format("YYYY-MM-DD hh:mm A z")}
      </TableCell>
      <TableCell>
        <Button
          sx={{
            mt: 0,
            whiteSpace: "nowrap",
            minWidth: "auto",
            color: colors.blue,
            borderColor: colors.blue,
          }}
          startIcon={<Trash color="red" />}
          variant="outlined"
          onClick={handleDeleteClick}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
});

export const PaymentMethods = ({
  isModal = false,
  onClose,
  accountInfo = false,
  onSaveCardDetails,
  autoPayDetails,
  paymentDetailsPage = false,
}: CustomersTableProps): React.JSX.Element => {
  const { setContextLoading } = useLoading();

  React.useLayoutEffect(() => {
    if (!paymentDetailsPage) {
      setContextLoading(true);
    }
  }, []);
  const dispatch = useDispatch();
  const { accountLoading, paymentMethodInfoCards } = useSelector(
    (state: RootState) => state?.Account
  );
  const [selectedId, setSelectedId] = React.useState<{ card_token: number; id: number } | null>(null);

  const [cardModalOpen, setCardModalOpen] = React.useState(false);
  const [bankModalOpen, setBankModalOpen] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [deleteCardDetails, setDeleteCardDetails] =
    React.useState<CardDetails | null>(null);
  const stored = React.useMemo(() => {
    const raw = getLocalStorage("intuity-user");
    return typeof raw === "object" && raw !== null
      ? (raw as IntuityUser)
      : null;
  }, []);

  React.useEffect(() => {
    const formdata = new FormData();
    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("customer_id", stored?.body?.customer_id);
    if (!paymentDetailsPage) {
      dispatch(
        getPaymentDetails(
          formdata,
          undefined,
          undefined,
          setContextLoading
        )
      );
    }
  }, [dispatch]);
  const handleSaveDetails = () => {
    const selectedCardDetails = Object.keys(paymentMethodInfoCards).filter(
      (key) => paymentMethodInfoCards[key].card_token === selectedId?.card_token
    )[0];
    if (onSaveCardDetails) {
      onSaveCardDetails(paymentMethodInfoCards[selectedCardDetails]);
      return;
    }
    if (autoPayDetails) {
      autoPayDetails(
        paymentMethodInfoCards[selectedCardDetails],
        String(selectedId?.card_token)
      );
      return;
    }
    const formdata = new FormData();
    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("customer_id", stored?.body?.customer_id);
    formdata.append("model_open", "2");
    formdata.append("payment_method", String(selectedId?.card_token));

    dispatch(
      getPaymentDetails(formdata, true, () => {
        setSelectedId(null);
      })
    );
  };

  const myCards = React.useMemo(() => {
    if (!paymentMethodInfoCards) return [];
    return Object.keys(paymentMethodInfoCards).map((key) => {
      const card = paymentMethodInfoCards[key];
      return {
        name: card?.account_type ? card.account_type : card.card_type ?? "_",
        number:
          card?.bank_account_number && card?.bank_account_number !== "undefined"
            ? card.bank_account_number
            : card.card_number ?? "_",
        type: card?.card_type ? "card" : "Account",
        createdAt: card.date_used,
        id: card.id,
        card_type: card.card_type,
        card_token: card.card_token,
      };
    });
  }, [paymentMethodInfoCards]);

  // 🧠 3. Stable selection callback
  const selectOne = React.useCallback((data: { card_token: number; id: number }) => {
    setSelectedId(data);
  }, []);
  const handleDelete = React.useCallback((row: CardDetails) => {
    setOpenConfirm(true);
    setDeleteCardDetails(row);
  }, []);

  const handleConfirm = React.useCallback(() => {
    const formData = new FormData();
    formData.append("acl_role_id", stored?.body?.acl_role_id);
    formData.append("customer_id", stored?.body?.customer_id);
    formData.append("id", deleteCardDetails?.id?.toString() || "");
    formData.append("payment_method", "1");
    formData.append("customerid", stored?.body?.customer_id);

    dispatch(
      deleteCardAndBankAccount(
        formData,
        deleteCardDetails?.card_type ? "card" : "bank_account",
        () => {
          setOpenConfirm(false);
          // Refresh payment methods
          const refreshForm = new FormData();
          refreshForm.append("acl_role_id", stored?.body?.acl_role_id);
          refreshForm.append("customer_id", stored?.body?.customer_id);
          dispatch(getPaymentDetails(refreshForm));
        }
      )
    );
  }, [deleteCardDetails, dispatch]);

  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );

  const customerData = React.useMemo(
    () => dashBoardInfo?.customer ?? (getLocalStorage("intuity-customerInfo") as CustomerInfo | null),
    [dashBoardInfo?.customer]
  );
  const companyId = customerData?.company_id;

  React.useEffect(() => {
    if (!companyId) return;
    const formdata = new FormData();
    formdata.append("acl_role_id", stored?.body?.acl_role_id);
    formdata.append("company_id", companyId);
    dispatch(
      getPaymentProcessorDetails(
        formdata,
        false,
        undefined,
        () => {
          if (paymentDetailsPage) {
            setContextLoading(false);
          }
        }
      )
    );
  }, [companyId]);

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
  return (
    <>
      <Card
        sx={{
          borderRadius: boarderRadius.card,
        }}
      >
        {accountInfo && <Header title="Payment Method" />}
        <DialogActions
          sx={{
            px: isModal ? 3 : 0, // padding top and bottom (2 * 8 = 16px)
            pr: 1,
            py: isModal ? 2 : 1,
          }}
        >
          <Button
            onClick={() => setCardModalOpen(true)}
            sx={{ color: colors.blue, borderColor: colors.blue }}
            variant="outlined"
          >
            New Card
          </Button>
          <Button
            onClick={() => setBankModalOpen(true)}
            color="primary"
            variant="contained"
            sx={{
              backgroundColor: colors.blue,
              "&:hover": { backgroundColor: colors["blue.3"] },
            }}
          >
            New Bank Account
          </Button>
          {isModal && (
            <Button
              sx={{
                // width: '2px',
                // backgroundColor: 'red',
                minWidth: 0,
                padding: "4px",
                // backgroundColor: 'red',
                width: "32px", 
                height: "32px",
              }}
              onClick={onClose}
            >
              <X size={24} color={colors.blue} />
            </Button>
          )}
        </DialogActions>

        <Card
          sx={{
            width: isModal ? "95%" : "100%",
            mx: "auto",
            borderRadius: boarderRadius.card,
          }}
        >
          <Box sx={{ overflowX: "auto", height: isModal ? "400px" : "auto" }}>
            <Table sx={{ minWidth: "800px" }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Number</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              {/* <TableBody>
            

              {myCards.map((row) => (
                <CardRow
                  key={row.id}
                  row={row}
                  isSelected={selectedId === row.card_token}
                  onSelect={selectOne}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody> */}

              <TableBody>{memoizedCardRows}</TableBody>
            </Table>
          </Box>
          <Divider />
          <Grid
            mt={0}
            container
            spacing={0}
            justifyContent="flex-end"
            alignItems="center"
            sx={{
              py: isModal ? 1 : 0,
            }}
          >
            <Grid item>
              {/* <Typography variant="h6">*Fees will apply</Typography> */}
              <Typography
                variant="body2"
                sx={{
                  // color: 'text.secondary',
                  pr: 1, // space between text and buttons
                }}
              >
                * Fees will apply
              </Typography>
            </Grid>
            <Grid item>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  onClick={() => setSelectedId(null)}
                  variant="outlined"
                  sx={{ color: colors.blue, borderColor: colors.blue }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDetails}
                  variant="contained"
                  disabled={!selectedId}
                  sx={{
                    backgroundColor: colors.blue,
                    "&:hover": { backgroundColor: colors["blue.3"] },
                  }}
                >
                  Save details
                </Button>
              </CardActions>
            </Grid>
          </Grid>
        </Card>

        {/* Modals */}
        {cardModalOpen && (
          <AddCardModal
            open={cardModalOpen}
            onClose={() => setCardModalOpen(false)}
            onSuccess={() => setCardModalOpen(false)}
          />
        )}
        {bankModalOpen && (
          <AddBankAccountModal
            open={bankModalOpen}
            onClose={() => setBankModalOpen(false)}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={openConfirm}
          title={deleteCardDetails?.card_type ? "Card" : "Bank Account"}
          message={`Are you sure want to Delete this ${
            deleteCardDetails?.card_type ? "Card" : "Bank Account"
          }?`}
          confirmLabel="Yes, Confirm"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={() => setOpenConfirm(false)}
          loader={accountLoading}
        />

        {/* Loading Backdrop */}
        <CustomBackdrop
          open={accountLoading}
          style={{ zIndex: 1300, color: "#fff" }}
        >
          <Loader />
        </CustomBackdrop>
      </Card>
    </>
  );
};
