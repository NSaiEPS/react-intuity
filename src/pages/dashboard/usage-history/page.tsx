import * as React from 'react';
import type { Metadata } from 'next';
import { CardHeader, Chip, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';

import { companySlugs, config } from '@/config';
import BarChart from '@/components/dashboard/overview/billing-usage';
import { Sales } from '@/components/dashboard/overview/sales';
import UsageFilter from '@/components/dashboard/overview/usage-filter';
import UsageHeader from '@/components/dashboard/overview/usage-header';

export const metadata = { title: `Usage - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}
export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <UsageHeader />
      <Grid lg={8} xs={12}>
        <UsageFilter />
        <Sales
          path="usage-history"
          chartSeries={[
            { name: '2025', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
            { name: '2024', data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13] },
          ]}
          sx={{ height: '100%' }}
        />
        {/* <BarChart /> */}

        <BarChart />
      </Grid>
    </Stack>
  );
}
