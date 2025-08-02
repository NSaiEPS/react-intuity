import * as React from "react";
import Box from "@mui/material/Box";

import CompanyDetails from "./company-details";
import OneTimePaymentCard from "./register-slag";

// import OneTimePaymentCard from '@/components/auth/register-slag';
// import { SignInForm } from '@/components/auth/sign-in-form';

export function SignInPage(): React.JSX.Element {
  return (
    <Box
      sx={{
        // height: '100vh', // 🔥 important: fills full screen
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box>
        <OneTimePaymentCard />
      </Box>
      <Box
        sx={{
          marginTop: 5,
        }}
      >
        <CompanyDetails />
      </Box>
    </Box>
  );
}
