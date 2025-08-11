import * as React from "react";
import Box from "@mui/material/Box";

import CompanyDetails from "./company-details";
import OneTimePaymentCard from "./register-slag";
import { Helmet } from "react-helmet";

// import OneTimePaymentCard from '@/components/auth/register-slag';
// import { SignInForm } from '@/components/auth/sign-in-form';

export function SignInPage({ title }): React.JSX.Element {
  console.log(title);
  return (
    <Box
      sx={{
        // height: '100vh', // 🔥 important: fills full screen
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet key={title}>
        <title>{title}</title>
      </Helmet>
      <Box
        sx={{
          marginTop: 5,
        }}
      >
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
