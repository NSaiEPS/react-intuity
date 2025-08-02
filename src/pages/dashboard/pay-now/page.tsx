import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';

import { companySlugs, config } from '@/config';
import { LastBill } from '@/components/dashboard/customer/last-bill-box';

export const metadata = { title: `Billing - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <LastBill />
    </Stack>
  );
}
