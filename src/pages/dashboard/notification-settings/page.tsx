import * as React from 'react';
import type { Metadata } from 'next';
import { boarderRadius } from '@/utils';
import { Card, CardHeader, Divider, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { companySlugs, config } from '@/config';
import NotificationsSettings from '@/components/dashboard/overview/notification-settings';
import { Notifications } from '@/components/dashboard/settings/notifications';

export const metadata = { title: `Notification Settings - ${config.site.name}` } satisfies Metadata;
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
        <CardHeader
          title={
            <Typography ml={1} variant="h5">
              Notification Settings
            </Typography>
          }
        />

        <CardHeader
          subheader={<Typography variant="h6">Name :TUCKER, GARY</Typography>}
          title={<Typography variant="h5">Account No :1146</Typography>}
        />
      </Grid>

      <Divider /> */}
      <NotificationsSettings />
      <Notifications />
    </Card>
  );
}
