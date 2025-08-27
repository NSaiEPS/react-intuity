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

export default function TwoFAModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<string>("");

  const handleSendCode = () => {
    console.log("Selected method:", method);
    // Call API to send code here
    onClose();
  };

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
            2FA Login (Account No. 1146)
          </Typography>

          <IconButton
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
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          To verify your identity, we need to send an authorization code to you.
        </Typography>

        <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
          xxx-xxx-8103
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
            label="Email (xxxxxxxil.com)"
          />
        </RadioGroup>

        <Typography variant="body2" sx={{ mb: 2 }}>
          The code expires 10 minutes after you request it.
        </Typography>

        <Typography variant="caption" color="text.secondary">
          You are consenting to be contacted at the phone number selected for
          the purpose of receiving an authorization code. If you selected text
          message, Wireless and text message fees may apply from your carrier.
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
    </Dialog>
  );
}
