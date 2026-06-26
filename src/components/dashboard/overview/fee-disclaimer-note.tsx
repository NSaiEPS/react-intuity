import * as React from "react";
import { Typography } from "@mui/material";

export function FeeDisclaimerNote(): React.JSX.Element {
  return (
    <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 4 }}>
      <strong>This is a fee-based service.</strong> A convenience fee will be applied to all credit
      card and electronic check transactions.
    </Typography>
  );
}
