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
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";

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
  const confirmInfo = useSelector(
    (state: RootState) => state?.Account?.confirmInfo
  );
  const customerInfo = customerData;

  const onSubmit = (data: FormValues) => {
    onVerify(data.code);
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
