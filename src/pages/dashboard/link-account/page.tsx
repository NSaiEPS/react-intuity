import * as React from "react";

import { boarderRadius } from "@/utils";
import { Card, CardHeader, Divider, Grid, Typography } from "@mui/material";
import Stack from "@mui/material/Stack";

//import { companySlugs, config } from "@/config";
import AddAccountPage from "@/components/dashboard/overview/add-account";

//export const metadata = {
//   title: `Link Accounts - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function LinkAccountPage(): React.JSX.Element {
  return (
    <AddAccountPage />

    // <Card
    //   sx={{
    //     borderRadius: boarderRadius.card,
    //   }}
    // >
    //   <Grid container spacing={2} justifyContent="space-between">
    //     <CardHeader
    //       title={
    //         <Typography ml={1} variant="h5">
    //           Link Accounts
    //         </Typography>
    //       }
    //     />

    //     <CardHeader
    //       subheader={<Typography variant="h6">Name :TUCKER, GARY</Typography>}
    //       title={<Typography variant="h5">Account No :1146</Typography>}
    //     />
    //   </Grid>

    //   <Divider />
    //   <AddAccountPage />
    // </Card>
  );
}
