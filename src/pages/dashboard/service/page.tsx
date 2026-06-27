import * as React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { CustomerDetailsForm } from "@/components/dashboard/service/customer-service";
import { Card } from "@mui/material";
import { boarderRadius } from "@/utils";
import Header from '@/components/CommonComponents/Header';

import { useLoading } from "@/components/core/skeleton-context";
import { ServiceSkeleton } from "@/components/dashboard/skeletons";

export default function CustomerServicePage(): React.JSX.Element {
  const { contextLoading } = useLoading();

  return (
    <>
      {contextLoading && <ServiceSkeleton />}
      <Card sx={{ borderRadius: boarderRadius.card, display: contextLoading ? 'none' : 'block' }}>
        <Header title="Contact Customer Service" />
        <Grid container spacing={3}>
          <Grid lg={12} md={12} xs={12}>
            <CustomerDetailsForm />
          </Grid>
        </Grid>
      </Card>
    </>
  );
}
