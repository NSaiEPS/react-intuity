import * as React from "react";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import { X } from "@phosphor-icons/react";
import { useMediaQuery, useTheme } from "@mui/material";

import { AccountMenuList } from "./account-menu-list";
import { NotificationsPopover } from "./notifications-popover";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { useDispatch } from "react-redux";
import { getNotificationList } from "@/state/features/dashBoardSlice";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  type: string;
  openType?: string;
}

export function UserPopover({
  anchorEl,
  onClose,
  open,
  type = "email",
  openType,
}: UserPopoverProps): React.JSX.Element {
  const theme = useTheme();
    const dispatch = useDispatch();
  
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const raw = getLocalStorage("intuity-user");
    const stored: IntuityUser | null =
      typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
  
    const roleId = stored?.body?.acl_role_id;
    const userId = stored?.body?.customer_id;
  const successCallBack = () => {
    const formData = new FormData();
    formData.append("acl_role_id", String(roleId || ""));
    formData.append("customer_id", String(userId || ""));
    formData.append("page_no", '0');
    formData.append("onlyread", "1" );
    formData.append("markRead", "0");
    formData.append("model_open", "9");

    dispatch(getNotificationList(formData));
  };

  React.useEffect(() => { 
    if (openType === "email" ) {
      successCallBack();
    }
  }, []);
  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            width: isMobile ? "90vw" : type === "email" ? "350px" : "500px",
            marginLeft: isMobile ? 0 : type === "email" ? "0px" : "-200px",
            maxWidth: "100%",
            outline: "none",
            boxShadow: (theme) => theme.shadows[3],
            "&:focus": { outline: "none" },
            "&:focus-visible": { outline: "none" },
          },
        },
      }}
    >
      <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ p: 1, pb: 0 }}>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </Box>

      {type === "email" ? (
        <AccountMenuList onClose={onClose} isMobile={isMobile} />
      ) : (
        <NotificationsPopover onClose={onClose} isMobile={isMobile} open={open} openType={openType} />
      )}
    </Popover>
  );
}
