import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "nsaicomponents";
import { colors } from "@/utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { paths } from "@/utils/paths";
import { useUser } from "@/hooks/use-user";
import { useNavigate } from "react-router";

// ✅ Zod schema
const schema = z.object({
  code: z
    .string()
    .min(4, "Authorization code must be at least 4 characters")
    .max(12, "Authorization code must not exceed 12 characters"),
});

type FormValues = z.infer<typeof schema>;

type AuthCodeModalProps = {
  open: boolean;

  onClose: () => void;
  onVerify: (code: string) => void;
  customerData: any;
};

export default function AuthCodeModal({
  open,

  onClose,
  onVerify,
  customerData,
}: AuthCodeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const customerInfo = customerData;
  const accountLoading = useSelector(
    (state: RootState) => state?.Account?.accountLoading
  );
  const raw = getLocalStorage("intuity-user");
  const { checkSession } = useUser();
  const navigate = useNavigate();

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const role_id = stored?.body?.acl_role_id;

  const dispatch = useDispatch();

  const handleSendCode = (data: FormValues) => {
    onVerify(data.code);

    // id:810
    // 2fa:1
    // phone_no:(194) 920-0811
    // model_open:13
    // acl_role_id:4
    // customer_id:810
    // country_code:1
    // selected_value:method

    let roleId = stored?.body?.acl_role_id;
    let userId = stored?.body?.customer_id;
    let token = stored?.body?.token;

    const formData = new FormData();

    formData.append("id", userId);
    formData.append("2fa", "1");

    formData.append("model_open", "14");
    formData.append("acl_role_id", role_id);
    formData.append("customer_id", userId);
    formData.append("country_code", "1");
    formData.append("phone_no", "0");
    formData.append("otp", data.code);

    // "id:810
    // 2fa:1
    // phone_no:0
    // model_open:14
    // acl_role_id:4
    // customer_id:810
    // country_code:1
    // otp:553871"

    dispatch(updateAccountInfo(token, formData, true, onSubmit));
  };

  const onSubmit = async (data: FormValues) => {
    await checkSession?.();

    navigate(paths.dashboard.overview());
    reset();
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={500}>
          Enter the authorization code you received: (Account No.{" "}
          {customerInfo?.acctnum})
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleSendCode)} noValidate>
        <DialogContent>
          <Box mt={1}>
            <TextField
              fullWidth
              placeholder="Authorization Code"
              {...register("code")}
              error={!!errors.code}
              helperText={errors.code?.message}
              sx={{
                "& .MuiInputBase-input::placeholder": {
                  color: "rgba(0,0,0,0.6) !important", // gray placeholder
                  opacity: 1,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
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
            loading={accountLoading}
            disabled={accountLoading}
            type="submit"
            //   onClick={handleVerify}
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
            Verify
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
