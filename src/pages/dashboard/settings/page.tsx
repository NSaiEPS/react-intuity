import * as React from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

//import { companySlugs, config } from "@/config";
import { AccountSettingsForm } from "@/components/dashboard/settings/account-settings";
import { Notifications } from "@/components/dashboard/settings/notifications";
import { UpdatePasswordForm } from "@/components/dashboard/settings/update-password-form";

// //export const metadata = {
//   title: `Settings  - ${config.site.name}`,
// } satisfies Metadata;
// export async function generateStaticParams() {
//   return companySlugs.map((company) => ({ company }));
// }
export default function SettingsPage(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Update Login and Password</Typography>
      </div>
      {/* no need as of now */}
      {/* <Notifications /> */}
      <AccountSettingsForm />
      <UpdatePasswordForm />
    </Stack>
  );
}
