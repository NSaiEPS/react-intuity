import * as React from "react";
import { colors } from "@/utils";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";
import { Button } from "nsaicomponents";
import { Box } from "@mui/system";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loader?: boolean;
  checkBox?: boolean;
  details?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loader = false,
  checkBox = false,
  details,
}: ConfirmDialogProps): React.JSX.Element {
  const [checked, setChecked] = React.useState(false);

  // Reset checkbox when dialog closes
  React.useEffect(() => {
    if (!open) setChecked(false);
  }, [open]);

  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 4 },
          width: { xs: "95%", sm: "auto" },
          maxWidth: { xs: "100%", sm: "70%", md:"50%", lg:"35%" },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: { xs: "1rem", sm: "1.25rem" },
          p: 2,
          pb: { xs: 1, sm: 2 },
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{
        minWidth: { sm: "400px" },
        px: 2,
        py: 0,
        m: 0,
        wordBreak: "break-word"
      }}>
        {details && <Box sx={{ mb: 2 }}>{details}</Box>}

        {checkBox ? (
          <FormControlLabel
            style={{ margin: 0 }}
            control={
              <Checkbox
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                color="primary"
                size="small"
                sx={{ m: 0 }}
              />
            }
            label={
              <DialogContentText
                sx={{
                  whiteSpace: "pre-line",
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                }}
              >
                {message}
              </DialogContentText>
            }
            sx={{
              alignItems: "flex-start",
              mt: 1,
            }}
          />
        ) : (
          <DialogContentText
            sx={{
              whiteSpace: "pre-line",
              fontSize: { xs: "0.85rem", sm: "1rem" },
            }}
          >
            {message}
          </DialogContentText>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onCancel}
          color="inherit"
          variant="outlined"
          size="small"
          textTransform="none"
          disabled={loader}
          style={{
            color: colors.blue,
            borderColor: colors.blue,
            borderRadius: "12px",
            // height: "41px",
            background: "white",
          }}
        >
          {cancelLabel}
        </Button>

        <Button
          onClick={onConfirm}
          disabled={loader || (checkBox && !checked)}
          loading={loader}
          variant="contained"
          size="small"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{
            borderRadius: "12px",
            // height: "41px",
            backgroundColor: colors.blue,
            color: "white",
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog >
  );
}
