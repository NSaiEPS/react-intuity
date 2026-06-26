import * as React from "react";
import Stack from "@mui/material/Stack";
import { PaymentMethods } from "@/components/dashboard/customer/payment-methods";
import { useLoading } from "@/components/core/skeleton-context";
import { PaymentMethodsSkeleton } from "@/components/dashboard/skeletons";

export default function PaymentMethodsPage(): React.JSX.Element {
  const { contextLoading } = useLoading();

  return (
    <>
      {contextLoading && <PaymentMethodsSkeleton />}
      <Stack spacing={3} sx={{ display: contextLoading ? 'none' : 'flex' }}>
        <PaymentMethods count={10} page={0} rowsPerPage={10} accountInfo={true} />
      </Stack>
    </>
  );
}
