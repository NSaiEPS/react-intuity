import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "nsaicomponents";
import { colors } from "@/utils";
import { useDispatch, useSelector } from "@/hooks/redux";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { CheckCircle } from "@phosphor-icons/react";

// ✅ Zod schema
const schema = z.object({
  code: z
    .string()
    .length(6, "Authorization code must be 6 digits")
    // .max(6, "Authorization code must be 6 digits")
    .regex(/^\d+$/, "Authorization code must contain numbers only"),
});

type FormValues = z.infer<typeof schema>;

interface CustomerInfo {
  customer_name: string;
  acctnum: number;
  id?: number;
  company_logo?: string;
  paperless?: 0 | 1;
  allow_overpayments?: number;
  balance?: number;
  email?: string;
  company_id?: string;
}

type AuthCodeModalProps = {
  open: boolean;
  selectedVal: string;
  onClose: () => void;
  onVerify: (code: string) => void;
  customerData: CustomerInfo | null;
  onClose2Fa: () => void;
  /**
   * Message coming back from the API, e.g.
   * "We've sent a verification code to m****@gmail.com."
   * Any masked-email-looking substring inside it is auto-highlighted.
   */
  verificationMessage?: string;
  /** Static helper copy shown under the message. Overridable if the API drives it too. */
  helperText?: string;
};

// Highlights an email-like substring (e.g. "m****@gmail.com") inside the API message
// so it renders like the underlined blue text in the mock, without needing a separate prop.
// Masks the local part of an email, keeping only the first character, e.g.
// "michael@gmail.com" -> "m****@gmail.com". Leaves already-masked emails alone.
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.includes("*")) return email;
  const firstChar = local.charAt(0);
  return `${firstChar}****@${domain}`;
}

function renderMessageWithEmailHighlight(message: string): React.ReactNode {
  const emailPattern = /[a-zA-Z0-9*._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const parts = message.split(emailPattern);
  const matches = message.match(emailPattern) ?? [];

  return parts.reduce<React.ReactNode[]>((acc, part, i) => {
    acc.push(<React.Fragment key={`t-${i}`}>{part}</React.Fragment>);
    if (matches[i]) {
      acc.push(
        <Box
          key={`e-${i}`}
          component="span"
          sx={{ color: colors.blue, textDecoration: "underline", fontWeight: 500 }}
        >
          {maskEmail(matches[i])}
        </Box>
      );
    }
    return acc;
  }, []);
}

export default function AuthCodeModal({
  open,
  selectedVal,
  onClose,
  onVerify,
  customerData,
  onClose2Fa,
  verificationMessage = "We've sent a verification code to your registered contact.",
  helperText = "Enter the verification code below to continue signing in.",
}: AuthCodeModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { otpLoading } = useSelector(
    (state: RootState) => state?.Account
  );
  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const role_id = stored?.body?.acl_role_id;

  const dispatch = useDispatch();

  const handleSendCode = (data: FormValues) => {
    onVerify(data.code);

    const userId = stored?.body?.customer_id;

    const formData = new FormData();

    formData.append("id", userId);
    formData.append("2fa", "1");

    formData.append("model_open", "14");
    formData.append("acl_role_id", role_id);
    formData.append("customer_id", userId);
    formData.append("country_code", "1");
    formData.append("phone_no", "0");
    formData.append("otp", data.code);
    formData.append("selected_value", selectedVal);

    dispatch(
      updateAccountInfo(
        formData,
        true,
        onSubmit,
        "otp",
        false,
        undefined,
        false,
        true
      )
    );
  };

  const onSubmit = async (_data: FormValues) => {
    reset();
    onClose();
    onClose2Fa();
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          px: 1,
        },
      }}
    >
      <form onSubmit={handleSubmit(handleSendCode)} noValidate>
        <DialogContent sx={{ pt: 4, pb: 1 }}>
          <Stack alignItems="center" spacing={2.5} textAlign="center">
            <CheckCircle size={64} color="#1FAA59" weight="fill" />

            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 0.5 }}>
                {selectedVal === "text_message" || selectedVal === "phone_call"
                  ? "Check Your Mobile"
                  : "Check Your Email"}
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                {renderMessageWithEmailHighlight(verificationMessage)}
              </Typography>
            </Box>

            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
              {helperText}
            </Typography>

            <Box sx={{ width: "100%" }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 1 }}>
                Verification Code
              </Typography>
              <TextField
                {...register("code", {
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  },
                })}
                error={!!errors.code}
                helperText={""}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 6,
                  minLength: 6,
                  style: { textAlign: "center" },
                }}
                sx={{
                  width: 160,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
              />

              {errors.code && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{
                    mt: 1,
                    width: { md: 280 },
                    mx: "auto",
                    textAlign: "center",
                    display: "block",
                  }}
                >
                  {errors.code.message}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 4, pt: 2, justifyContent: "center", gap: 1.5 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            textTransform="none"
            style={{
              color: colors.blue,
              borderColor: colors.blue,
              backgroundColor: "white",
              borderRadius: "24px",
              height: "41px",
              minWidth: "120px",
            }}
          >
            Cancel
          </Button>
          <Button
            loading={otpLoading}
            disabled={otpLoading}
            type="submit"
            variant="contained"
            textTransform="none"
            bgColor={colors.blue}
            hoverBackgroundColor={colors["blue.3"]}
            hoverColor="white"
            style={{
              borderRadius: "24px",
              height: "41px",
              minWidth: "120px",
            }}
          >
            VERIFY
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}