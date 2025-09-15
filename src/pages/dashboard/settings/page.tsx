import * as React from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

//import { companySlugs, config } from "@/config";
import { AccountSettingsForm } from "@/components/dashboard/settings/account-settings";
import { Notifications } from "@/components/dashboard/settings/notifications";
import { UpdatePasswordForm } from "@/components/dashboard/settings/update-password-form";
import { Card } from "@mui/material";
import { boarderRadius } from "@/utils";

// //export const metadata = {
//   title: `Settings  - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function SettingsPage(): React.JSX.Element {
  return (
    <Card
      sx={{
        borderRadius: boarderRadius.card,
      }}
    >
      <div>
        <Typography variant="h5" m={2}>
          Update Login and Password
        </Typography>
      </div>
      {/* no need as of now */}
      {/* <Notifications /> */}
      <AccountSettingsForm />
      <UpdatePasswordForm />
    </Card>
  );
}
