import React, { useState } from "react";
import { getConfirmInfo } from "@/state/features/accountSlice";
import { getNotificationList } from "@/state/features/dashBoardSlice";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  // Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { X } from "@phosphor-icons/react";
// import { Button } from 'nsaicomponents';
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z as zod } from "zod";

import Button from "../CommonComponents/Button";

// Zod schema
const schema = zod.object({
  email: zod
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export default function EmailDialog({ open, onClose, clickedDetails }) {
  const dispatch = useDispatch();
  const [isPending, setIsPending] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(schema),
  });

  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const raw = getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const successCallBack = () => {
    setIsPending(false);
    onClose();

    let role_id = stored?.body?.acl_role_id;
    let user_id = stored?.body?.customer_id;
    let token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", role_id);
    formData.append("customer_id", user_id);
    dispatch(getConfirmInfo(token, formData));
  };

  const onSubmit = (data) => {
    setIsPending(true);
    console.log("Saved email:", data.email);

    let role_id = stored?.body?.acl_role_id;
    let user_id = stored?.body?.customer_id;
    let token = stored?.body?.token;

    const formData = new FormData();
    formData.append("acl_role_id", role_id);
    formData.append("customer_id", clickedDetails?.id);
    formData.append("model_open", "8");
    formData.append("notification_email", data.email);

    dispatch(getNotificationList(token, formData, successCallBack, false));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Change Notification Email (Account No. 1146)
        <IconButton onClick={onClose} edge="end">
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          This email is where you will receive notifications and may be the same
          as a login email.
        </Typography>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              variant="outlined"
              label="Notification Email Address"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          textTransform="none"
          style={{
            color: colors.blue,
            borderColor: colors.blue,
            borderRadius: "12px",
            height: "41px",
          }}
        >
          Cancel
        </Button>
        <Button
          // onClick={handleSubmit(onSubmit)}
          // variant="contained"
          // sx={{
          //   backgroundColor: colors.blue,
          //   '&:hover': {
          //     backgroundColor: colors['blue.3'],
          //   },
          // }}

          disabled={isPending}
          loading={isPending}
          type="submit"
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{
            borderRadius: "12px",
            height: "41px",
            // backgroundColor: 'red',
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
