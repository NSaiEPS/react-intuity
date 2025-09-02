import React, { useReducer } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { Button } from "nsaicomponents";
import { colors } from "@/utils";
// import { X } from "@phosphor-icons/react";
import VerifyModal from "../CommonComponents/VerifyModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { toast } from "react-toastify";

// -------------------- Types --------------------
interface CustomerData {
  acctnum?: string;
  phone_no?: string;
  email?: string;
}

interface TwoFAModalProps {
  open: boolean;
  onClose: () => void;
  customerData: CustomerData;
}

interface State {
  method: string;
  isVerifyModalOpen: boolean;
}

type Action =
  | { type: "SET_METHOD"; payload: string }
  | { type: "OPEN_VERIFY_MODAL" }
  | { type: "CLOSE_VERIFY_MODAL" };

const maskPhone = (phone?: string) =>
  phone ? `xxx-xxx-${phone.slice(-4)}` : "xx-xxx-";

const maskEmail = (email?: string) =>
  email ? `Email (xxxxxxx${email.slice(-6)})` : "Email (xxxxxxx";

const initialState: State = {
  method: "",
  isVerifyModalOpen: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_METHOD":
      return { ...state, method: action.payload };
    case "OPEN_VERIFY_MODAL":
      return { ...state, isVerifyModalOpen: true };
    case "CLOSE_VERIFY_MODAL":
      return { ...state, isVerifyModalOpen: false };
    default:
      return state;
  }
}

export default function TwoFAModal({
  open,
  onClose,
  customerData,
}: TwoFAModalProps) {
  const [state, dispatchLocal] = useReducer(reducer, initialState);

  const confirmInfo = useSelector((s: RootState) => s?.Account?.confirmInfo);
  const accountLoading = useSelector(
    (s: RootState) => s?.Account?.accountLoading
  );

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id ?? "";
  const userId = stored?.body?.customer_id ?? "";
  const token = stored?.body?.token ?? "";

  const dispatch = useDispatch();

  const handleSendCode = () => {
    if (!state.method) {
      toast.warning("Please select the method");
      return;
    }

    const formData = new FormData();
    formData.append("id", userId);
    formData.append("2fa", "1");
    formData.append("model_open", "13");
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("selected_value", state.method);

    if (state.method === "text_message") {
      formData.append("phone_no", customerData?.phone_no ?? "");
      formData.append("country_code", "1");
    } else if (state.method === "email") {
      formData.append("email", customerData?.email ?? "");
    }

    dispatch(
      updateAccountInfo(token, formData, true, () =>
        dispatchLocal({ type: "OPEN_VERIFY_MODAL" })
      )
    );
  };

  const onVerifyText = () => {
    // TODO: handle verification
  };

  const methods = [
    { value: "text_message", label: "Text message" },
    { value: "phone_call", label: "Phone call" },
    { value: "email", label: maskEmail(customerData?.email) },
  ];

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth

      // onClose={onClose}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight={600}>
            2FA Login (Account No. {customerData?.acctnum ?? ""})
          </Typography>
          {/* <IconButton aria-label="close" onClick={onClose}>
            <X size={24} color={colors.blue} />
          </IconButton> */}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Typography gutterBottom>
          To verify your identity, we need to send an authorization code to you.
        </Typography>

        <Typography fontWeight={500} mb={2}>
          {maskPhone(customerData?.phone_no)}
        </Typography>

        <Typography gutterBottom>How would you like to receive it?</Typography>

        <RadioGroup
          value={state.method}
          onChange={(e) =>
            dispatchLocal({ type: "SET_METHOD", payload: e.target.value })
          }
          sx={{ mb: 2 }}
        >
          {methods.map((m) => (
            <FormControlLabel
              key={m.value}
              value={m.value}
              control={<Radio />}
              label={m.label}
            />
          ))}
        </RadioGroup>

        {confirmInfo?.["2fa_expire_code_text"] && (
          <Typography variant="body2" mb={2}>
            {confirmInfo?.["2fa_expire_code_text"]}
          </Typography>
        )}

        {confirmInfo?.["2fa_consent_message"] && (
          <Typography variant="caption" color="text.secondary">
            {confirmInfo?.["2fa_consent_message"]}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          loading={accountLoading}
          disabled={!state.method || accountLoading}
          onClick={handleSendCode}
          type="button"
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{ borderRadius: 12, height: 41 }}
        >
          SEND CODE
        </Button>
      </DialogActions>

      <VerifyModal
        open={state.isVerifyModalOpen}
        onClose={() => dispatchLocal({ type: "CLOSE_VERIFY_MODAL" })}
        onVerify={onVerifyText}
        customerData={customerData}
        selectedVal={state.method}
      />
    </Dialog>
  );
}
