import * as React from "react";
import { boarderRadius } from "@/utils";
import { Card } from "@mui/material";
import NotificationsSettings from "@/components/dashboard/overview/notification-settings";
import { Notifications } from "@/components/dashboard/settings/notifications";
import { useLoading } from "@/components/core/skeleton-context";
import { NotificationSettingsSkeleton } from "@/components/dashboard/skeletons";

export default function NotificationSettingsPage(): React.JSX.Element {
  const { contextLoading } = useLoading();

  return (
    <>
      {contextLoading && <NotificationSettingsSkeleton />}
      <Card sx={{ borderRadius: boarderRadius.card, display: contextLoading ? 'none' : 'block' }}>
        <NotificationsSettings />
        {/* <Notifications /> */}
      </Card>
    </>
  );
}
