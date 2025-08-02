import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { companySlugs, config } from '@/config';
import { CustomerDetailsForm } from '@/components/dashboard/service/customer-service';

export const metadata = { title: `Customer - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Contact Customer Service</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid lg={12} md={12} xs={12}>
          <CustomerDetailsForm />
        </Grid>
      </Grid>
    </Stack>
  );
}
