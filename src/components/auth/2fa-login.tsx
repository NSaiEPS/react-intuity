import React, { useState } from "react";
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
  IconButton,
} from "@mui/material";
import { Button } from "nsaicomponents";
import { colors } from "@/utils";
import { X } from "@phosphor-icons/react";
import VerifyModal from "../CommonComponents/VerifyModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { updateAccountInfo } from "@/state/features/accountSlice";
import { toast } from "react-toastify";

export default function TwoFAModal({
  open,
  onClose,
  customerData,
}: {
  open: boolean;
  onClose: () => void;
  customerData: any;
}) {
  const [method, setMethod] = useState<string>("");
  const [isVerifyModalOPen, setIsVerifyModalOPen] = useState(false);
  const confirmInfo = useSelector(
    (state: RootState) => state?.Account?.confirmInfo
  );
  const accountLoading = useSelector(
    (state: RootState) => state?.Account?.accountLoading
  );
  const raw = getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  const role_id = stored?.body?.acl_role_id;

  const customerInfo = customerData;
  const dispatch = useDispatch();

  const handleSendCode = () => {
    if (!method) {
      toast.warning("Please select the method");

      return;
    }
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
    if (method == "text_message") {
      formData.append("phone_no", customerInfo?.phone_no);
      formData.append("country_code", "1");
    }
    if (method == "email") {
      formData.append("email", customerInfo?.email);
    }
    formData.append("model_open", "13");
    formData.append("acl_role_id", role_id);
    formData.append("customer_id", userId);

    formData.append("selected_value", method);

    dispatch(
      updateAccountInfo(token, formData, true, () => setIsVerifyModalOPen(true))
    );

    console.log("Selected method:", method);
    // Call API to send code here
    // onClose();
  };
  const onVerifyText = () => {};
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      {/* <DialogTitle sx={{ fontWeight: 600 }}>
        2FA Login (Account No. 1146)
      </DialogTitle> */}

      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            2FA Login (Account No. {customerInfo?.acctnum ?? ""})
          </Typography>

          {/* <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 13,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <X size={24} color={colors.blue} />
          </IconButton> */}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          To verify your identity, we need to send an authorization code to you.
        </Typography>

        <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
          xxx-xxx-{customerInfo?.phone_no?.slice(-4)}
        </Typography>

        <Typography variant="body1" gutterBottom>
          How would you like to receive it?
        </Typography>

        <RadioGroup
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          sx={{ mb: 2 }}
        >
          <FormControlLabel
            value="text_message"
            control={<Radio />}
            label="Text message"
          />
          <FormControlLabel
            value="phone_call"
            control={<Radio />}
            label="Phone call"
          />
          <FormControlLabel
            value="email"
            control={<Radio />}
            label={`Email (xxxxxxx${customerInfo?.email?.slice(-6)})`}
          />
        </RadioGroup>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {confirmInfo?.["2fa_expire_code_text"]}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {confirmInfo?.["2fa_consent_message"]}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          loading={accountLoading}
          disabled={accountLoading}
          onClick={handleSendCode}
          type="button"
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          // onClick={onSubmit}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{
            borderRadius: "12px",
            height: "41px",
            // backgroundColor: 'red',
          }}
        >
          SEND CODE
        </Button>
      </DialogActions>
      <VerifyModal
        open={isVerifyModalOPen}
        onClose={() => {
          setIsVerifyModalOPen(false);
          // onClose();
        }}
        onVerify={onVerifyText}
        customerData={customerData}
      />
    </Dialog>
  );
}
