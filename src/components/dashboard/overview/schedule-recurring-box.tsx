import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLastBillInfo } from "@/state/features/paymentSlice";
import { getDashboardInfo } from "@/state/features/dashBoardSlice";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";

import { Box, Typography, Divider, Stack } from "@mui/material";
import {
  CalendarBlank,
  ArrowsClockwise,
  Trash,
} from "@phosphor-icons/react/dist/ssr";

export function ScheduleRecurringBox() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);
  const paymentLoader = useSelector(
    (state: RootState) => state?.Payment?.paymentLoader
  );
  const lastBillInfo = useSelector(
    (state: RootState) => state?.Payment?.lastBillInfo
  );
  const userInfo = useSelector((state: RootState) => state?.Account?.userInfo);

  const {
    schedule_payment,
    recurring_payment_msg1,
    recurring_payment_msg2,
    schedule_payment_msg,
    recurring_payment,
  } = dashBoardInfo?.body || {};

  const raw = userInfo?.body ? userInfo : getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const [deleteType, setDeleteType] = React.useState("");

  const handleDeleteRecurring = (type: string) => {
    if (!deleteType) {
      setDeleteType(type);
      return;
    }

    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
    const token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    if (type === "schedule") {
      formData.append("scheduledId", "1");
    } else {
      formData.append("recurringId", recurring_payment?.id);
      formData.append("is_recurring_pay", "1");
      if (type === "All Recurring") {
        formData.append("all_payment", "1");
      } else {
        formData.append("next_payment", "1");
      }
    }

    dispatch(
      getLastBillInfo(formData, token, undefined, true, () => {
        setDeleteType("");
        dispatch(getDashboardInfo(roleId, userId, token));
      })
    );
  };

  if (!schedule_payment_msg && !recurring_payment_msg1) return null;

  return (
    <Box
      sx={{
        backgroundColor: "white",
        px: 3,
        py: 2,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        mb: 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <CalendarBlank size={20} color="#1976d2" weight="bold" />
        <Typography variant="body2" fontWeight="bold">
          {recurring_payment_msg1 || schedule_payment_msg}
        </Typography>
      </Stack>

      {recurring_payment_msg2 && (
        <Stack direction="row" spacing={2} alignItems="center" mt={1}>
          <ArrowsClockwise size={20} color="#1976d2" weight="bold" />
          <Typography variant="body2" fontWeight="bold">
            {recurring_payment_msg2}
          </Typography>
        </Stack>
      )}

      <Divider sx={{ my: 1 }} />

      {schedule_payment?.id ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Trash size={18} color="#d32f2f" weight="bold" />
          <Typography
            component="span"
            variant="body2"
            sx={{ color: "error.main", cursor: "pointer" }}
            onClick={() => handleDeleteRecurring("schedule")}
          >
            Delete Scheduled Payment
          </Typography>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <Trash size={18} color="#d32f2f" weight="bold" />
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "error.main", cursor: "pointer" }}
              onClick={() => handleDeleteRecurring("Next Recurring")}
            >
              Delete just the next payment
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            OR
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Trash size={18} color="#d32f2f" weight="bold" />
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "error.main", cursor: "pointer" }}
              onClick={() => handleDeleteRecurring("All Recurring")}
            >
              Delete all remaining recurring payments
            </Typography>
          </Stack>
        </Stack>
      )}

      <ConfirmDialog
        open={Boolean(deleteType)}
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
          if (deleteType) handleDeleteRecurring(deleteType);
        }}
        onCancel={() => setDeleteType("")}
        loader={paymentLoader}
      />
    </Box>
  );
}
