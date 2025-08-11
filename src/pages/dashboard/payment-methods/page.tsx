import * as React from "react";

import Stack from "@mui/material/Stack";

import { PaymentMethods } from "@/components/dashboard/customer/payment-methods";

export default function PaymentMethodsPage(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 10;

  return (
    <Stack spacing={3}>
      <PaymentMethods
        count={10}
        page={page}
        rowsPerPage={rowsPerPage}
        accountInfo={true}
      />
    </Stack>
  );
}
