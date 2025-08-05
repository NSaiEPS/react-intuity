import * as React from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";

//import { companySlugs, config } from "@/config";
import { SendBillDetailsForm } from "@/components/dashboard/account/send-bill-details";
import { TransferDetailsForm } from "@/components/dashboard/account/transfer-details";

//export const metadata = {
//   title: `Stop | Transfer - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function StopTransferServicePage(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4"> Stop/Transfer Service</Typography>
      </div>
      <Grid container spacing={3}>
        <Grid lg={12} md={12} xs={12}>
          <TransferDetailsForm />
          <SendBillDetailsForm />
        </Grid>
      </Grid>
    </Stack>
  );
}
