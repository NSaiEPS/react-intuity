import * as React from "react";
import { AccountSettingsForm } from "@/components/dashboard/settings/account-settings";
import { UpdatePasswordForm } from "@/components/dashboard/settings/update-password-form";
import { SettingsSkeleton } from "@/components/dashboard/skeletons";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { Box, Card, Divider } from "@mui/material";
import { boarderRadius } from "@/utils";
import Header from '@/components/CommonComponents/header-common';


export default function SettingsPage(): React.JSX.Element {
  const dashboardLoading = useSelector((state: RootState) => state?.DashBoard?.dashboardLoading);
  const hasData = useSelector((state: RootState) => !!state?.DashBoard?.dashBoardInfo?.body);

  const showSkeleton = !hasData && dashboardLoading;

  return (
    <>
      {showSkeleton && <SettingsSkeleton />}
      {/* <Card sx={{ borderRadius: boarderRadius.card, display: showSkeleton ? 'none' : 'block' }}>
        <Header title="Update Account Details and Password" />
        <AccountSettingsForm />
        <UpdatePasswordForm />
      </Card> */}

      <Card
  sx={{
    borderRadius: boarderRadius.card,
    display: showSkeleton ? "none" : "block",
    overflow: "hidden",
  }}
>
  <Header title="Update Account Details and Password" />

  <Divider/>

  <Box sx={{ p: 2 }}>
    <AccountSettingsForm />
  </Box>

  <Box sx={{ p: 2, pt: 0 }}>
    <UpdatePasswordForm />
  </Box>
</Card>
    </>
  );
}
