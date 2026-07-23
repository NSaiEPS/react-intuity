import * as React from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import Button from '@/components/CommonComponents/button-comp';

import { colors } from "@/utils";
import { FeeDisclaimerNote } from "./fee-disclaimer-note";

interface AddAccountStepOneProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  loading: boolean;
  onNext: () => void;
}

export function AddAccountStepOne({ control, errors, loading, onNext }: AddAccountStepOneProps): React.JSX.Element {
  return (
    <>
      <Typography variant="h6" fontWeight="bold" color="textSecondary">
        ADD ANOTHER ACCOUNT
      </Typography>

      <Controller
        name="accountNumber"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Account Number *"
            variant="outlined"
            fullWidth
            error={!!errors.accountNumber}
            sx={{
              "& input": {
                padding: "13px 13px",
              },
            }}
            helperText={typeof errors.accountNumber?.message === "string" ? errors.accountNumber.message : ""}
            inputProps={{
              inputMode: "decimal",
              pattern: "[0-9]*[.]?[0-9]*",
            }}
          />
        )}
      />

      <Controller
        name="authenticationType"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.authenticationType}>
            <InputLabel >Authentication *</InputLabel>
            <Select {...field}  sx={{
              "& input": {
                padding: "13px 13px",
              },
            }} label="Authentication *">
              <MenuItem value="last_name">Last Name</MenuItem>
              <MenuItem value="billing_street_name">Billing Street Name</MenuItem>
              <MenuItem value="pin">PIN</MenuItem>
            </Select>
            <Typography variant="caption" color="error" mx={2}>
              {typeof errors.authenticationType?.message == "string" ? errors.authenticationType?.message : ""}
            </Typography>
          </FormControl>
        )}
      />

      <Controller
        name="answer"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Answer *"
            variant="outlined"
            fullWidth
             sx={{
              "& input": {
                padding: "13px 13px",
              },
            }}
            error={!!errors.answer}
            helperText={typeof errors.answer?.message == "string" ? errors.answer?.message : ""}
          />
        )}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button
          disabled={loading}
          loading={loading}
          type="submit"
          variant="contained"
          textTransform="none"
          bgColor={colors.blue}
          hoverBackgroundColor={colors["blue.3"]}
          hoverColor="white"
          style={{ borderRadius: "12px", height: "41px", marginLeft: "auto" }}
          onClick={onNext}
        >
          NEXT
        </Button>
      </Box>

      <FeeDisclaimerNote />
    </>
  );
}
