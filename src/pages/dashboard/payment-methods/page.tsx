import * as React from 'react';
import type { Metadata } from 'next';
import { CardHeader, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { companySlugs, config } from '@/config';
import type { CardDetails } from '@/components/dashboard/customer/payment-methods';
import { PaymentMethods } from '@/components/dashboard/customer/payment-methods';

export const metadata = { title: `Payments - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}
export default function Page(): React.JSX.Element {
  const page = 0;
  const rowsPerPage = 10;

  // const paginatedCustomers = applyPagination(customers, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <PaymentMethods count={10} page={page} rowsPerPage={rowsPerPage} accountInfo={true} />
    </Stack>
  );
}
