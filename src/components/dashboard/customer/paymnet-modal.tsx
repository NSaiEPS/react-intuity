import React, { useState } from "react";
import { colors, formatToMMDDYYYY } from "@/utils";
import {
  Box,
  CircularProgress,
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
import { useDispatch, useSelector } from "@/hooks/redux";
import { RootState } from "@/state/store";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { getDashboardInfo } from "@/state/features/dashBoardSlice";
import { Button } from 'nsaicomponents';

const isFlagTruthy = (value: unknown): boolean => {
  if (value === true || value === 1) return true;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized !== "" &&
      normalized !== "0" &&
      normalized !== "false" &&
      normalized !== "no" &&
      normalized !== "null" &&
      normalized !== "undefined"
    );
  }
  return false;
};

const hasNonEmptyText = (value: unknown): boolean =>
  typeof value === "string" && value.trim().length > 0;

const hasPaymentRecord = (value: unknown): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("id" in obj) {
      return Boolean(obj.id) && String(obj.id).trim() !== "0";
    }
    return Object.keys(obj).length > 0;
  }
  return isFlagTruthy(value);
};

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentModal({
  open,
  onClose,
}: PaymentModalProps): React.JSX.Element {
  const [paymentOption, setPaymentOption] = useState<
    "payNow" | "schedule" | "autopay"
  >("payNow");
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPaymentOption(event.target.value as "payNow" | "schedule" | "autopay");
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const lastBillInfo = useSelector(
    (state: RootState) => state?.Payment?.lastBillInfo
  );
  const dashBoardInfo = useSelector(
    (state: RootState) => state?.DashBoard?.dashBoardInfo
  );
  const paymentLoader = useSelector(
    (state: RootState) => state?.Payment?.paymentLoader
  );
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const isAutopayEnabled =
    Number(lastBillInfo?.customer?.autopay) === 1 ||
    Number(dashBoardInfo?.body?.customer?.autopay) === 1 ||
    Number(dashBoardInfo?.customer?.autopay) === 1 ||
    lastBillInfo?.customer?.autopay === true ||
    lastBillInfo?.customer?.autopay === "1";

  const dashBoardBody = dashBoardInfo?.body || dashBoardInfo || {};
  const lastBillCustomerId = lastBillInfo?.customer?.id ?? lastBillInfo?.customer_id;
  const dashboardCustomerId = dashBoardBody?.customer?.id ?? dashBoardBody?.customer_id;
  const sameCustomer =
    Boolean(lastBillCustomerId && dashboardCustomerId) &&
    String(lastBillCustomerId) === String(dashboardCustomerId);

  const hasSingleScheduledPayment = Boolean(
    isFlagTruthy(lastBillInfo?.customer?.is_payment_schedule) ||
    isFlagTruthy(lastBillInfo?.is_payment_schedule) ||
    hasNonEmptyText(lastBillInfo?.schedule_payment_msg) ||
    hasPaymentRecord(lastBillInfo?.schedule_payment) ||
    hasPaymentRecord(lastBillInfo?.scheduled_payment) ||
    hasPaymentRecord(lastBillInfo?.get_schedule_payments) ||
    hasPaymentRecord(lastBillInfo?.get_scheduled_payments) ||
    (sameCustomer &&
      (isFlagTruthy(dashBoardBody?.customer?.is_payment_schedule) ||
        hasNonEmptyText(dashBoardBody?.schedule_payment_msg) ||
        hasPaymentRecord(dashBoardBody?.schedule_payment)))
  );

  const hasRecurringPayment = Boolean(
    isFlagTruthy(lastBillInfo?.customer?.is_recurring_payment) ||
    isFlagTruthy(lastBillInfo?.is_recurring_payment) ||
    hasNonEmptyText(lastBillInfo?.recurring_payment_msg1) ||
    hasNonEmptyText(lastBillInfo?.recurring_payment_msg2) ||
    hasPaymentRecord(lastBillInfo?.get_recurring_payments) ||
    hasPaymentRecord(lastBillInfo?.recurring_payment) ||
    (sameCustomer &&
      (isFlagTruthy(dashBoardBody?.customer?.is_recurring_payment) ||
        hasNonEmptyText(dashBoardBody?.recurring_payment_msg1) ||
        hasPaymentRecord(dashBoardBody?.recurring_payment)))
  );

  const hasScheduledOrRecurringPayment =
    hasSingleScheduledPayment || hasRecurringPayment;

  const scheduledPaymentMsg = hasNonEmptyText(lastBillInfo?.schedule_payment_msg)
    ? lastBillInfo?.schedule_payment_msg
    : sameCustomer && hasNonEmptyText(dashBoardBody?.schedule_payment_msg)
      ? dashBoardBody?.schedule_payment_msg
      : "";

  const recurringPaymentMsg = hasNonEmptyText(lastBillInfo?.recurring_payment_msg1)
    ? lastBillInfo?.recurring_payment_msg1
    : sameCustomer && hasNonEmptyText(dashBoardBody?.recurring_payment_msg1)
      ? dashBoardBody?.recurring_payment_msg1
      : "";

  const isModalLoading = Boolean(
    paymentLoader ||
    isRefreshing ||
    !lastBillInfo ||
    Object.keys(lastBillInfo).length === 0
  );

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const paymentLoaderRef = React.useRef(paymentLoader);
  paymentLoaderRef.current = paymentLoader;

  React.useEffect(() => {
    if (!open) return;
    setPaymentOption("payNow");
    setDeleteType("");
    setConfirmationOpen(false);

    if (roleId && userId && !paymentLoaderRef.current) {
      setIsRefreshing(true);
      const fd = new FormData();
      fd.append("acl_role_id", String(roleId));
      fd.append("customer_id", String(userId));
      fd.append("id", String(userId));
      dispatch(
        getLastBillInfo(
          fd,
          () => setIsRefreshing(false),
          false,
          undefined,
          true
        )
      );
    }
  }, [open, dispatch, roleId, userId]);

  const handleProceed = (): void => {
    // Proceed with the selected payment option
    onClose();
    if (paymentOption == "autopay") {
      navigate(paths.dashboard.autoPay());
      return;
    }
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
  const [deleteType, setDeleteType] = useState("");
  const handleDeleteRecurring = (type) => {
    if (!deleteType) {
      setDeleteType(type);
      return;
    }
    //console.log(type);
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    if (type == "schedule") {
      formData.append("scheduledId", "1");
    } else {
      const recurringId =
        lastBillInfo?.get_recurring_payments?.id ??
        lastBillInfo?.recurring_payment?.id ??
        (sameCustomer ? dashBoardBody?.recurring_payment?.id : "");
      formData.append("recurringId", recurringId);
      formData.append("is_recurring_pay", "1");
      if (type == "All Recurring") {
        formData.append("all_payment", "1");
      } else {
        formData.append("next_payment", "1");
      }
    }

    // recurringId:60
    // is_recurring_pay:1
    // next_payment:1

    dispatch(
      getLastBillInfo(formData, undefined, true, () => {
        setDeleteType("");
        onClose();
        const getData = new FormData();

        getData.append("acl_role_id", roleId);
        getData.append("customer_id", userId);
        getData.append("id", userId);

        dispatch(getLastBillInfo(getData));
        if (roleId && userId) {
          dispatch(getDashboardInfo(roleId, userId));
        }
      })
    );
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>When would you like to pay?</DialogTitle>
      <DialogContent>
        {isModalLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 160,
            }}
          >
            <CircularProgress size={32} sx={{ color: colors.blue }} />
          </Box>
        ) : (
          <>
            <FormControl component="fieldset" sx={{ width: "100%" }}>
              <RadioGroup value={paymentOption} onChange={handleChange}>
                {[
                  {
                    value: "payNow",
                    title: "Pay Now",
                    description:
                      lastBillInfo?.pay_now_text ??
                      lastBillInfo?.nacha_pay_now_text ??
                      lastBillInfo?.achworks_pay_now_text ??
                      // lastBillInfo?.achworks_pay_now_text ??
                      "Payment will be processed immediately.",
                    ...(hasScheduledOrRecurringPayment
                      ? {
                          extraInfo: (
                            <>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{ mt: 2 }}
                              >
                                •{" "}
                                {recurringPaymentMsg
                                  ? recurringPaymentMsg
                                  : hasSingleScheduledPayment
                                    ? (scheduledPaymentMsg ||
                                      "You have an existing scheduled payment.")
                                    : "Recurring Payment"}
                              </Typography>
                              {hasSingleScheduledPayment && !hasRecurringPayment ? (
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
                                  {hasSingleScheduledPayment && (
                                    <Box sx={{ mb: 0.5 }}>
                                      <Typography
                                        component="span"
                                        variant="body2"
                                        sx={{ color: "primary.main", cursor: "pointer" }}
                                        onClick={() => handleDeleteRecurring("schedule")}
                                      >
                                        Delete Scheduled Payment
                                      </Typography>
                                    </Box>
                                  )}
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{ color: "primary.main", cursor: "pointer" }}
                                    onClick={() =>
                                      handleDeleteRecurring("Next Recurring")
                                    }
                                  >
                                    Remove just the next payment?
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
                                    Remove all remaining recurring payments?
                                  </Typography>
                                </Box>
                              )}
                            </>
                          ),
                        }
                      : {}),
                  },
                  ...(!hasScheduledOrRecurringPayment
                    ? [
                        {
                          value: "schedule",
                          title: "Schedule a payment",
                          description:
                            lastBillInfo?.schedule_payment_text ??
                            "Make a single scheduled payment - that's it!",
                        },
                      ]
                    : []),
                  ...(lastBillInfo?.company?.allow_auto_payment == 1 &&
                  Number(lastBillInfo?.customer?.autopay) !== 1
                    ? [
                        {
                          value: "autopay",
                          title: "Sign up for Autopay",
                          description:
                            lastBillInfo?.text_autopay_billing ??
                            "Sign up to have your regular invoices automatically paid on their collection date with every billing cycle",
                        },
                      ]
                    : []),
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
                      ml: 0,
                      mr: 0,
                      width: "100%",
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
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={0.5}
                        >
                          {option.description}
                        </Typography>
                        {option.extraInfo}
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>

              {lastBillInfo?.company?.allow_auto_payment == 1 &&
                Number(lastBillInfo?.customer?.autopay) === 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                      ml: 0,
                      mr: 0,
                      width: "100%",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      • Autopay is enabled.
                    </Typography>
                  </Box>
                )}
            </FormControl>

            {lastBillInfo?.autopay_text && (
              <Box mt={2}>
                <Typography variant="body2">
                  <strong>{lastBillInfo?.autopay_text}</strong>
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          pr: 3,
          pb: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          textTransform="capitalize"
          style={{
            color: colors.blue,
            borderColor: colors.blue,
            backgroundColor: "white",
            borderRadius: '12px',
            height: '41px',
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={isModalLoading}
          onClick={() => {
            if (isModalLoading) return;
            if (paymentOption === "autopay") {
              handleProceed();
              return;
            }
            if (paymentOption === "payNow" && isAutopayEnabled) {
              setConfirmationOpen(true);
            } else if (
              (lastBillInfo?.pending_payment?.length > 0 &&
                lastBillInfo?.pending_payment_text) ||
              recurringPaymentMsg ||
              scheduledPaymentMsg
            ) {
              setConfirmationOpen(true);
            } else {
              handleProceed();
            }
          }}
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
          Proceed to Payment
        </Button>
      </DialogActions>

      <ConfirmDialog
        open={confirmationOpen || deleteType ? true : false}
        title={
          deleteType ? `Remove ${deleteType}` : "Pending Payment Confirmation"
        }
        message={
          deleteType
            ? `Are you sure you want to remove your ${deleteType} payment?`
            : paymentOption === "payNow" && isAutopayEnabled
              ? "Autopay is enabled. Do you still want to make an additional payment?"
              : recurringPaymentMsg
                ? `${recurringPaymentMsg} Do you still want to make an additional payment?`
                : scheduledPaymentMsg
                  ? `${scheduledPaymentMsg} Do you still want to make an additional payment?`
                  : `${lastBillInfo?.pending_payment_text ?? ""}`
        }
        confirmLabel={
          paymentOption === "payNow" && isAutopayEnabled && !deleteType
            ? "Proceed"
            : "Yes, Confirm"
        }
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
