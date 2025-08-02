import * as React from 'react';
import type { Metadata } from 'next';
import { RootState } from '@/state/store';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useSelector } from 'react-redux';

import { companySlugs, config } from '@/config';
import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';
import { NewDetailsForm } from '@/components/dashboard/account/new-details-form';

export const metadata = { title: `Account  - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Account</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid lg={6} md={6} xs={12}>
          <AccountInfo />
        </Grid>
        <Grid lg={12} md={6} xs={12}>
          <AccountDetailsForm />
          {/* no need as of now */}
          {/* <NewDetailsForm /> */}
        </Grid>
      </Grid>
    </Stack>
  );
}
