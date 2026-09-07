import * as React from "react";

import { getNotificationList } from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "@/hooks/redux";
import { useNavigate } from "react-router-dom";
import { paths } from "@/utils/paths";

interface NotificationsPopoverProps {
  onClose: () => void;
  isMobile: boolean;
  open: boolean;
  openType?: string;
}

export function NotificationsPopover({
  onClose,
  isMobile,
  open,
  openType,
}: NotificationsPopoverProps): React.JSX.Element {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const routeChecker = useSelector((state: RootState) => state?.DashBoard?.routeChecker);
  const { notificationList, notificationLoading } = useSelector(
    (state: RootState) => state?.DashBoard
  );

  const [onlyUnread, setOnlyUnread] = React.useState(true);
  const [pageNo, setPageNo] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [localNotifications, setLocalNotifications] = React.useState<any[]>([]);

  const successCallBack = () => {
    const formData = new FormData();
    formData.append("acl_role_id", String(roleId || ""));
    formData.append("customer_id", String(userId || ""));
    formData.append("onlyread", onlyUnread ? "1" : "0");
    formData.append("page_no", String(pageNo - 1));
    formData.append("markRead", "0");
    formData.append("model_open", "9");

    dispatch(getNotificationList(formData));
  };

  React.useEffect(() => {
    if (openType === "email" ) {
      successCallBack();
    }
  }, [onlyUnread, pageNo]);

  React.useEffect(() => {
    if (notificationList?.notifications) {
      setLocalNotifications(notificationList.notifications);
    }
    if (notificationList?.count) {
      setTotalPages(Math.ceil(notificationList.count / 10));
    }
  }, [notificationList]);

  const handleNotificationClick = (item) => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("model_open", "10");
    formData.append("id", item?.id);

    const navigateForItem = () => {
      if (item?.type === "paperless_status") {
        navigate(paths.dashboard.paperless());
      } else if (item?.type === "autopay_status") {
        navigate(paths.dashboard.autoPay());
      } else {
        navigate(paths.dashboard.overview());
      }
      dispatch(getNotificationList(formData, successCallBack));
    };

    if (routeChecker) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );
      if (confirmLeave) navigateForItem();
    } else {
      navigateForItem();
    }

    onClose();
  };

  const handleDeleteNotification = (id?: string) => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("model_open", "10");
    formData.append("is_delete", "1");
    formData.append("id", id ? id : "-2");

    if (id) {
      // Soft delete — remove from local state immediately on success
      dispatch(
        getNotificationList(formData, () => {
          setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
        })
      );
    } else {
      // Delete all — re-fetch since everything is cleared server-side
      dispatch(getNotificationList(formData, successCallBack));
    }
  };

  const handleMarkAllRead = () => {
    const formData = new FormData();
    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("model_open", "9");
    formData.append("onlyread", "0");
    formData.append("markRead", "1");
    formData.append("page_no", "1");

    dispatch(getNotificationList(formData, successCallBack));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: isMobile ? 2 : 3,
        width: isMobile ? "90vw" : 500,
        maxWidth: "100%",
      }}
    >
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#0E1E40", fontSize: isMobile ? 16 : undefined }}>
          Notifications
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ color: "#0E1E40", fontSize: isMobile ? 12 : 14 }}>
            Only show unread
          </Typography>
          <Switch
            checked={onlyUnread}
            onChange={() => {
              setOnlyUnread((p) => !p);
              setPageNo(1);
            }}
            color="success"
          />
        </Stack>
      </Grid>

      <Grid container justifyContent="space-between" mt={3} mb={3}>
        <Typography
          variant="body2"
          sx={{ color: "grey.600", cursor: "pointer", fontSize: isMobile ? 12 : 14 }}
          onClick={(e) => {
            e?.stopPropagation();
            handleDeleteNotification();
          }}
        >
          Delete all
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "grey.600", cursor: "pointer", fontSize: isMobile ? 12 : 14 }}
          onClick={(e) => {
            e?.stopPropagation();
            handleMarkAllRead();
          }}
        >
          Mark all as read
        </Typography>
      </Grid>

      {notificationLoading ? (
        <Box>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i}>
              <Box sx={{ py: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1, pr: 2 }}>
                  <Skeleton variant="text" width="45%" height={22} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="90%" height={18} />
                  <Skeleton variant="text" width="70%" height={18} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="35%" height={16} />
                </Box>
                <Skeleton variant="circular" width={20} height={20} sx={{ mt: 0.5, flexShrink: 0 }} />
              </Box>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
        </Box>
      ) : !localNotifications?.length ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No notifications
          </Typography>
        </Box>
      ) : null}

      <List dense disablePadding>
        {!notificationLoading &&
          localNotifications?.map((item) => (
            <Box
              key={item.id}
              onClick={(e) => {
                e?.stopPropagation();
                handleNotificationClick(item);
              }}
            >
              <ListItem
                alignItems="flex-start"
                sx={{ px: 0, py: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={600} color="text.primary" fontSize={isMobile ? 13 : 14}>
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" fontSize={isMobile ? 12 : 14}>
                        {item.comments}
                      </Typography>
                      <Typography variant="caption" color="grey.500" fontSize={isMobile ? 10 : 12}>
                        {dayjs(item.date_time).format("MMM D, YYYY hh:mm A")}
                      </Typography>
                    </>
                  }
                />
                <Box sx={{ mt: 0.5 }}>
                  <Trash
                    size={20}
                    color="#888"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      e?.stopPropagation();
                      handleDeleteNotification(item.id);
                    }}
                  />
                </Box>
              </ListItem>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
      </List>

      {localNotifications.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, width: "100%" }}>
          <Pagination
            count={Math.max(1, totalPages)}
            page={pageNo}
            onChange={(_, value) => setPageNo(value)}
            color="primary"
            size={isMobile ? "small" : "medium"}
            sx={{
              "& .MuiPagination-ul": {
                flexWrap: "nowrap",
                justifyContent: "center",
              },
              "& .MuiPaginationItem-root": {
                minWidth: { xs: 26, sm: 32 },
                height: { xs: 26, sm: 32 },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                margin: { xs: "0 1px", sm: "0 3px" },
                padding: { xs: "0 2px", sm: "0 6px" },
              },
              "& .MuiPaginationItem-ellipsis": {
                minWidth: { xs: 16, sm: "auto" },
                padding: { xs: "0 1px", sm: "0 4px" },
                margin: { xs: "0 1px", sm: "0 3px" },
                height: "auto",
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
}
