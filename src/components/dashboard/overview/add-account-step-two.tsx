import * as React from "react";
import { Box, TextField, Typography } from "@mui/material";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import Button from "@/components/CommonComponents/button";
import { colors } from "@/utils";
import { FeeDisclaimerNote } from "./fee-disclaimer-note";

interface AddAccountStepTwoProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function AddAccountStepTwo({ control, errors, loading, onBack, onNext }: AddAccountStepTwoProps): React.JSX.Element {
  return (
    <>
      <Typography variant="h5" fontWeight="bold" color="textSecondary">
        NOTIFICATION EMAIL
      </Typography>

      <Controller
        name="notificationEmail"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Notification Email *"
            variant="outlined"
            fullWidth
            error={!!errors.notificationEmail}
            helperText={
              typeof errors.notificationEmail?.message === "string" ? errors.notificationEmail?.message : ""
            }
          />
        )}
      />

      <Controller
        name="confirmEmail"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Confirm Notification Email *"
            variant="outlined"
            fullWidth
            error={!!errors.confirmEmail}
            helperText={typeof errors.confirmEmail?.message == "string" ? errors.confirmEmail?.message : ""}
          />
        )}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button
          onClick={onBack}
          variant="outlined"
          textTransform="none"
          style={{ color: colors.blue, borderColor: colors.blue, borderRadius: "12px", height: "41px" }}
        >
          BACK
        </Button>
        <Button
          disabled={loading}
          loading={loading}
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{ borderRadius: "12px", height: "41px" }}
          onClick={onNext}
        >
          NEXT
        </Button>
      </Box>

      <FeeDisclaimerNote />
    </>
  );
}
