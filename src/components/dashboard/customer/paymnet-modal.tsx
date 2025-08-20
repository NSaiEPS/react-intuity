import React, { useState } from "react";
import { colors, formatToMMDDYYYY } from "@/utils";
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
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { getLastBillInfo } from "@/state/features/paymentSlice";

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
  const paymentLoader = useSelector(
    (state: RootState) => state?.Payment?.paymentLoader
  );

  const navigate = useNavigate();

  const handleProceed = (): void => {
    // Proceed with the selected payment option
    onClose();

    navigate(paths.dashboard.paymentDetails(lastBillInfo?.last_bill?.id), {
      state: {
        isSchedule: paymentOption == "schedule" ? true : false,
        dueDate: formatToMMDDYYYY(
          lastBillInfo?.last_bill?.due_date,
          false,
          true
        ),
        customer_acknowledgement_text:
          lastBillInfo?.customer_acknowledgement_text,
      },
    });
  };
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const [deleteType, setDeleteType] = useState("");
  const handleDeleteRecurring = (type) => {
    if (!deleteType) {
      setDeleteType(type);
      return;
    }
    console.log(type);
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    if (type == "schedule") {
      formData.append("scheduledId", 1);
    } else {
      formData.append("recurringId", userId);
      formData.append("is_recurring_pay", "1");
      formData.append("next_payment", "1");
    }

    // recurringId:60
    // is_recurring_pay:1
    // next_payment:1

    dispatch(
      getLastBillInfo(formData, token, undefined, true, () => {
        setDeleteType("");
        onClose();
        const getData = new FormData();

        getData.append("acl_role_id", roleId);
        getData.append("customer_id", userId);
        getData.append("id", userId);

        dispatch(getLastBillInfo(getData, token));
      })
    );
  };
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>When would you like to pay?</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" sx={{ width: "100%", pl: 1 }}>
          <RadioGroup value={paymentOption} onChange={handleChange}>
            {(lastBillInfo?.recurring_payment_msg1 ||
            lastBillInfo?.customer?.is_payment_schedule ||
            lastBillInfo?.customer?.is_recurring_payment
              ? [
                  {
                    value: "payNow",
                    title: "Pay Now",
                    description:
                      lastBillInfo?.pay_now_text ??
                      "Payment will be processed immediately.",
                    extraInfo: (
                      <>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ mt: 2 }}
                        >
                          •{" "}
                          {lastBillInfo?.recurring_payment_msg1
                            ? lastBillInfo?.recurring_payment_msg1
                            : lastBillInfo?.customer?.is_payment_schedule
                            ? `Payment Schedule for ${lastBillInfo?.customer?.payment_schedule_date}`
                            : "Recurring Payment"}
                        </Typography>
                        {lastBillInfo?.customer?.is_payment_schedule ? (
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: "primary.main", cursor: "pointer" }}
                              onClick={() => handleDeleteRecurring("schedule")}
                            >
                              Delete
                            </Typography>{" "}
                          </Box>
                        ) : (
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: "primary.main", cursor: "pointer" }}
                              onClick={() =>
                                handleDeleteRecurring("Next Recurring")
                              }
                            >
                              Delete just the next payment?
                            </Typography>{" "}
                            OR{" "}
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: "primary.main", cursor: "pointer" }}
                              onClick={() =>
                                handleDeleteRecurring("All Recurring")
                              }
                            >
                              Delete all remaining recurring payments?
                            </Typography>
                          </Box>
                        )}
                      </>
                    ),
                  },
                ]
              : [
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
                      "Make a single scheduled payment - that's it!",
                  },
                ]
            ).map((option) => (
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
                    borderColor: "primary.main",
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
                    {option.extraInfo}
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
        open={confirmationOpen || deleteType}
        title={
          deleteType ? `Delete ${deleteType}` : "Pending Payment Confirmation"
        }
        message={
          deleteType
            ? `Are you sure you want to delete your ${deleteType} payment?`
            : `${lastBillInfo?.pending_payment_text}`
        }
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (deleteType) {
            handleDeleteRecurring(deleteType);
          } else {
            setConfirmationOpen(false);
            handleProceed();
          }
        }}
        onCancel={() => {
          if (deleteType) {
            setDeleteType("");
          } else {
            setConfirmationOpen(false);
          }
        }}
        loader={paymentLoader}
      />
    </Dialog>
  );
}
