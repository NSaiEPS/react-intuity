import { colors } from "@/utils";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  Button,
  Box,
  Stack,
  IconButton,
  Grid,
  CardActions,
} from "@mui/material";
import { X } from "@phosphor-icons/react";
import dayjs from "dayjs";

interface PaymentSummaryModalProps {
  open: boolean;
  onClose: () => void;
  onPay: () => void;
  amount: number;
  fee: number;
  cardType: string;
  cardLast4: string;
  dueDate?: string | null | Date;
  Recurring?: string | null;
  Payment?: string | null;
}

export default function PaymentSummaryModal({
  open,
  onClose,
  onPay,
  amount,
  fee,
  cardType,
  cardLast4,
  dueDate,
  Recurring = null,
  Payment = null,
}: PaymentSummaryModalProps) {
  const total = amount + fee;
  const recurrenceMap = {
    1: "and every month",
    2: "and every other month",
    3: "and every 3 months",
    6: "and every 6 months",
    12: "and every 12 months",
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Payment Summary
          </Typography>
          <Button
            sx={{
              // width: '2px',
              // backgroundColor: 'red',
              minWidth: 0,
              padding: "4px",
              // backgroundColor: 'red',
              width: "32px", // or any visible size
              height: "32px",
            }}
            onClick={onClose}
          >
            <X size={24} color={colors.blue} />
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1">Payment Type</Typography>
            <Typography variant="body1">{cardType}</Typography>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1">Card/Bank No.</Typography>
            <Typography variant="body1">{cardLast4}</Typography>
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography>Invoice Amount</Typography>
          <Typography>${amount}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography>Convenience Fee</Typography>
          <Typography>${fee}</Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Total Payment
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            ${total}
          </Typography>
        </Stack>
        {dueDate && (
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Date To Pay
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {dayjs(dueDate).format("MMM D, YYYY")}
            </Typography>
          </Stack>
        )}
        {Recurring && (
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Recurring
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "red" }}
            >
              {recurrenceMap[Recurring] ?? ""}{" "}
              {/* {Payment !== "Thereafter" ? Payment : ""} */}
            </Typography>
          </Stack>
        )}
        {Payment && (
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Payment
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "red" }}
            >
              {Payment === "Thereafter"
                ? "Thereafter"
                : `${Payment} Additional Times`}
              {/* Additional Times */}
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          flexDirection: "column",
          gap: 1,
          px: 2,
          pb: 3,
        }}
      >
        <Box
          sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
        >
          <CardActions
            sx={{
              justifyContent: "flex-end",

              marginLeft: "auto",
            }}
          >
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{ color: colors.blue, borderColor: colors.blue }}
            >
              Cancel
            </Button>
            <Button
              onClick={onPay}
              variant="contained"
              sx={{
                backgroundColor: colors.blue,
                "&:hover": { backgroundColor: colors["blue.3"] },
              }}
            >
              Pay Now
            </Button>
          </CardActions>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
