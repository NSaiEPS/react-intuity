import * as React from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";

//import { companySlugs, config } from "@/config";
import { CustomerDetailsForm } from "@/components/dashboard/service/customer-service";
import { Card } from "@mui/material";
import { boarderRadius } from "@/utils";

//export const metadata = {
//   title: `Customer - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function CustomerServicePage(): React.JSX.Element {
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      <div>
        <Typography variant="h5" m={2}>
          Contact Customer Service
        </Typography>
      </div>
      <Grid container spacing={3}>
        <Grid lg={12} md={12} xs={12}>
          <CustomerDetailsForm />
        </Grid>
      </Grid>
    </Card>
  );
}
