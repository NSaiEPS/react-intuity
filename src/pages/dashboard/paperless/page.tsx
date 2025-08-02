import * as React from 'react';
import type { Metadata } from 'next';
import { boarderRadius, colors } from '@/utils';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { companySlugs, config } from '@/config';
import PayerTermsConditionsModal from '@/components/dashboard/customer/payer-terms-conditions-modal';

export const metadata = { title: `Paper Less - ${config.site.name}` } satisfies Metadata;
export async function generateStaticParams() {
  return companySlugs.map((company) => ({ company }));
}
export default function Page(): React.JSX.Element {
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      {/* <Grid container spacing={2} justifyContent="space-between">
        <CardHeader title={<Typography variant="h5">Paperless</Typography>} />

        <CardHeader
          subheader={<Typography variant="h6">Name :TUCKER, GARY</Typography>}
          title={<Typography variant="h5">Account No :1146</Typography>}
        />
      </Grid> */}

      <PayerTermsConditionsModal />
    </Card>
  );
}
