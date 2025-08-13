import React, { useState } from "react";
import { colors } from "@/utils";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { paths } from "@/utils/paths";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentModal({
  open,
  onClose,
}: PaymentModalProps): React.JSX.Element {
  const [paymentOption, setPaymentOption] = useState<"payNow" | "schedule">(
    "payNow"
  );
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPaymentOption(event.target.value as "payNow" | "schedule");
  };

  const lastBillInfo = useSelector(
    (state: RootState) => state?.Payment?.lastBillInfo
  );
  const navigate = useNavigate();

  const handleProceed = (): void => {
    // Proceed with the selected payment option
    onClose();

    navigate(paths.dashboard.paymentDetails(lastBillInfo?.last_bill?.id));
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>When would you like to pay?</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" sx={{ width: "100%", pl: 1 }}>
          <RadioGroup value={paymentOption} onChange={handleChange}>
            {[
              {
                value: "payNow",
                title: "Pay Now",
                description:
                  lastBillInfo?.pay_now_text ??
                  "Payment will be processed immediately.",
              },
              {
                value: "schedule",
                title: "Schedule a payment",
                description:
                  lastBillInfo?.schedule_payment_text ??
                  "Schedule a single or recurring payment of a set amount. If your scheduled payment does not pay the full balance by the due date, late fees may apply.",
              },
            ].map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",

                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2,
                  pr: 0,
                  mr: 0,
                  mb: 2,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    borderColor: colors.blue,
                    // boxShadow: 1,
                  },
                }}
                label={
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {option.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>
        {lastBillInfo?.autopay_text && (
          <Box mt={2}>
            <Typography variant="body2">
              <strong>{lastBillInfo?.autopay_text}</strong>
            </Typography>
          </Box>
        )}
        {/* //{" "}
        <Box mt={2}>
          //{" "}
          <Typography variant="body2">
            //{" "}
            <strong>
              // • Autopay Is //{" "}
              {lastBillInfo?.customer?.autopay ? "Enabled" : " Not Enabled"} //{" "}
            </strong>
            //{" "}
          </Typography>
          //{" "} */}
        {/* </Box> */}
      </DialogContent>

      <DialogActions
        sx={{
          pr: 3,
          pb: 2,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: colors.blue,
            borderColor: colors.blue,
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (
              lastBillInfo?.pending_payment?.length > 0 &&
              lastBillInfo?.pending_payment_text
            ) {
              setConfirmationOpen(true);
            } else {
              handleProceed();
            }
          }}
          color="primary"
          variant="contained"
          sx={{
            backgroundColor: colors.blue,
            "&:hover": {
              backgroundColor: colors["blue.3"], // or any other hover color
            },
          }}
        >
          Proceed to Payment
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={confirmationOpen}
        title={"Pending Payment Confirmation"}
        message={`${lastBillInfo?.pending_payment_text}`}
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmationOpen(false);
          handleProceed();
        }}
        onCancel={() => {
          setConfirmationOpen(false);
        }}
        loader={false}
      />
    </Dialog>
  );
}
