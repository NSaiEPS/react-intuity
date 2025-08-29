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
import { colors } from "@/utils";
import { Button } from "nsaicomponents";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";

type AuthCodeModalProps = {
  open: boolean;

  onClose: () => void;
  onVerify: (code: string) => void;
};

export default function VerifyModal({
  open,

  onClose,
  onVerify,
}: AuthCodeModalProps) {
  const [code, setCode] = React.useState("");
  const confirmInfo = useSelector(
    (state: RootState) => state?.Account?.confirmInfo
  );
  const customerInfo = confirmInfo?.customers?.[0];
  const handleVerify = () => {
    onVerify(code);
    setCode("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={500}>
          Enter the authorization code you received: (Account No.{" "}
          {customerInfo?.acctnum})
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box mt={1}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Authorization Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            sx={{
              "& .MuiInputBase-input::placeholder": {
                color: "gray !important", // gray
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
          // disabled={isPending}
          //         loading={isPending}
          type="submit"
          onClick={handleVerify}
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
    </Dialog>
  );
}
