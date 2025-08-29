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
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";

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

  const customerInfo = customerData;

  const handleSendCode = () => {
    setIsVerifyModalOPen(true);
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
            value="sms"
            control={<Radio />}
            label="Text message"
          />
          <FormControlLabel
            value="call"
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
          onClose();
        }}
        onVerify={onVerifyText}
        customerData={customerData}
      />
    </Dialog>
  );
}
