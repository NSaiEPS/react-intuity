import * as React from "react";

import { Box, Typography } from "@mui/material";
import { ConfirmInfoDetails } from "@/components/auth/confirm-info";

// import { ConfirmInfoDetails } from '@/components/auth/confirm-info';

// ✅ This line disables static export for this page

// ✅ Lazy load ConfirmInfoDetails

export default function ConfirmInformation() {
  // return <ConfirmInfoDetails />;
  return (
    <Box
      p={4}
      sx={{
        px: { xs: 2, sm: 4, md: 8, lg: 20 },
      }}
    >
      <ConfirmInfoDetails />

      <Typography
        variant="body2"
        color="text.secondary"
        mt={6}
        fontWeight="bold"
        textAlign="center"
      >
        This is a fee-based service. A convenience fee will be applied to all
        credit card and electronic check transactions.
      </Typography>
    </Box>
  );
}
