import * as React from "react";

import {
  linkAnotherAccount,
  setUserInfo,
  updateAccountInfo,
} from "@/state/features/accountSlice";
import {
  getDashboardInfo,
  getNotificationList,
} from "@/state/features/dashBoardSlice";
import { RootState } from "@/state/store";
import { getLocalStorage, setLocalStorage } from "@/utils/auth";
import {
  Avatar,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Switch,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { UserCircle, XCircle } from "@phosphor-icons/react";
import { LinkSimple, Trash, X } from "@phosphor-icons/react/dist/ssr";
import { GearSix as GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { SignOut as SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import dayjs from "dayjs";
import { Loader } from "nsaicomponents";
import { useDispatch, useSelector } from "react-redux";
// import { getLocalStorage } from '@/utils/auth';
import secureLocalStorage from "react-secure-storage";

// import { Trash } from '@phosphor-icons/react/dist/ssr/Trash'

import { authClient } from "@/lib/auth/client";
import { logger } from "@/lib/default-logger";
import { useUser } from "@/hooks/use-user";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { paths } from "@/utils/paths";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  type: string;
}

export function UserPopover({
  anchorEl,
  onClose,
  open,
  type = "email",
}: UserPopoverProps): React.JSX.Element {
  const { checkSession } = useUser();
  type IntuityUser = {
    body?: {
      acl_role_id?: string;
      customer_id?: string;
      token?: string;
    };
  };
  const raw = getLocalStorage("intuity-user");

  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;
  const { dashBoardInfo, notificationList, notificationLoader } = useSelector(
    (state: RootState) => state?.DashBoard
  );
  const { accountLoading } = useSelector((state: RootState) => state?.Account);
  const CustomerInfo = getLocalStorage("intuity-customerInfo");
  const linkedCustomerInfo = getLocalStorage("linked-customerInfo");

  const [onlyUnread, setOnlyUnread] = React.useState(false);
  const { user_name, email, loginID, company_logo } =
    dashBoardInfo?.body?.customer || CustomerInfo || {};
  const linkedAccountsInfo =
    dashBoardInfo?.body?.linked_customers || linkedCustomerInfo || [];
  const [linkedAccounts, setLinkedAccounts] = React.useState([]);
  React.useEffect(() => {
    setLinkedAccounts(linkedAccountsInfo);
  }, [dashBoardInfo]);
  const dispatch = useDispatch();
  // console.log(linkedAccounts, 'linkedAccounts');

  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [switchConfirm, setSwitchConfirm] = React.useState(false);
  // console.log(switchConfirm, 'switchConfirm');
  const [accountDetails, setAccountDetails] = React.useState<any>({});
  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error("Sign out error", error);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router and we need to do it manually
      // router.refresh();
      // After refresh, AuthGuard will handle the redirect
    } catch (err) {
      logger.error("Sign out error", err);
    }
  }, [checkSession]);
  const successCallBack = (id?: string | number) => {
    // console.log(id, 'idsuccessCallBack');

    if (id) {
      let newLinkedAccounts = [...linkedAccounts];
      newLinkedAccounts = newLinkedAccounts.filter(
        (account) => account.id !== id
      );
      // linkedAccounts = newLinkedAccounts;
      setLinkedAccounts(newLinkedAccounts);
      // localStorage.setItem('linked-customerInfo', JSON.stringify(linkedAccounts));

      secureLocalStorage.setItem("linked-customerInfo", linkedAccounts);

      setOpenConfirm(false);
      // Handle linked case
      return;
    }
    // console.log(linkedAccounts, 'linkedAccounts');
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("onlyread", onlyUnread ? "1" : "0");
    formData.append("page_no", "0");
    formData.append("markRead", "0");
    formData.append("model_open", "9");
    // formData.append('is_form', '0');

    dispatch(getNotificationList(token, formData));
  };
  // console.log(linkedAccounts, 'linkedAccounts');

  React.useEffect(() => {
    successCallBack();
  }, [onlyUnread]);
  const navigate = useNavigate();

  const handleNotificationClick = (item) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    formData.append("model_open", "10");
    formData.append("id", item?.id);

    dispatch(getNotificationList(token, formData, successCallBack));

    console.log(item, "itemmm");
    if (item?.type === "paperless_status") {
      navigate(paths.dashboard.paperless());
    } else if (item?.type === "autopay_status") {
      navigate(paths.dashboard.autoPay());
    } else {
      navigate(paths.dashboard.overview());
    }
    onClose();
    // paths.dashboard.overview;
  };

  const handleDeleteNotification = (id?: string) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    formData.append("model_open", "10");
    formData.append("is_delete", "1");

    formData.append("id", id ? id : "-2");

    dispatch(getNotificationList(token, formData, successCallBack));
  };

  const handleMarkAllRead = (id?: string) => {
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);

    formData.append("model_open", "9");

    formData.append("onlyread", "0");
    formData.append("markRead", "1");
    formData.append("page_no", "1");

    dispatch(getNotificationList(token, formData, successCallBack));
  };

  const handleCancelLink = () => {
    // console.log(account, 'account');
    // return;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("model_open", "7");
    formData.append("customer_id", accountDetails?.link_customer_id);

    dispatch(
      updateAccountInfo(token, formData, true, () =>
        successCallBack(accountDetails?.id)
      )
    );
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // const stored: IntuityUser | null = typeof raw === 'object' && raw !== null ? (raw as IntuityUser) : null;

  const hanldeAccountClick = (data = accountDetails) => {
    onClose();
    let roleId = stored?.body?.acl_role_id;

    let token = stored?.body?.token;
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("login", data?.link_customer_id);

    // dispatch(updateAccountInfo(token, formData, true, successCallBackLinkedAccount, true));
    dispatch(
      linkAnotherAccount(
        token,
        formData,

        successCallBackLinkedAccount
      )
    );
  };
  const successCallBackLinkedAccount = (data) => {
    let storeddata = { ...stored };
    storeddata.body = { ...storeddata.body, ...data };
    dispatch(setUserInfo(storeddata));

    setLocalStorage("intuity-user", storeddata);

    let roleId = storeddata?.body?.acl_role_id;
    let userId = storeddata?.body?.customer_id;
    let token = storeddata?.body?.token;
    dispatch(getDashboardInfo(roleId, userId, token));
    const formData = new FormData();

    formData.append("acl_role_id", roleId);
    formData.append("customer_id", userId);
    formData.append("onlyread", onlyUnread ? "1" : "0");
    formData.append("page_no", "0");
    formData.append("markRead", "0");
    formData.append("model_open", "9");
    // formData.append('is_form', '0');

    dispatch(getNotificationList(token, formData));
  };

  return (
    // <Popover
    //   anchorEl={anchorEl}
    //   anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    //   onClose={onClose}
    //   open={open}
    //   slotProps={{
    //     paper: {
    //       sx: {
    //         width: type === 'email' ? '350px' : '500px',
    //         marginLeft: type === 'email' ? '0px' : '-200px',
    //       },
    //     },
    //   }}
    // >
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
          },
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ p: 1, pb: 0 }}
      >
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </Box>
      {/* <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{user_name}</Typography>
        <Typography color="text.secondary" variant="body2">
          {email}ddd
        </Typography>
      </Box> */}
      {type === "email" ? (
        <MenuList
          disablePadding
          sx={{ p: "8px", "& .MuiMenuItem-root": { borderRadius: 1 } }}
        >
          {linkedAccounts.map((account, index) => (
            <MenuItem
              key={index}
              sx={{
                alignItems: "flex-start",
                backgroundColor:
                  stored?.body?.customer_id == account?.link_customer_id
                    ? "grey.100"
                    : "transparent",
                mb: 1,
                borderRadius: 2,
                py: 1.5,
                px: 2,
                position: "relative",
              }}
              onClick={(e) => {
                e?.stopPropagation();
                // hanldeAccountClick(account);
                if (stored?.body?.customer_id != account?.link_customer_id) {
                  setAccountDetails(account);
                  setSwitchConfirm(true);
                }
              }}
            >
              <Avatar
                sx={{
                  width: isMobile ? 28 : 32,
                  height: isMobile ? 28 : 32,
                  mt: 0.5,
                  bgcolor: "grey.300",
                  mr: 1.5,
                }}
              >
                <UserCircle size={20} weight="fill" />
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight="bold" fontSize={isMobile ? 13 : 14}>
                  {account.name}
                </Typography>
                <Typography
                  component="span"
                  fontSize={isMobile ? 11 : 13}
                  color="text.secondary"
                >
                  ({account.email})
                </Typography>
                <Typography
                  fontSize={isMobile ? 10 : 11}
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {account.company_name}
                </Typography>
                <Typography
                  fontSize={isMobile ? 11 : 13}
                  color="text.secondary"
                >
                  Account No: {account.acctnum}
                </Typography>
                {stored?.body?.customer_id == account?.link_customer_id && (
                  <Typography
                    fontSize={isMobile ? 10 : 12}
                    sx={{ mt: 0.5 }}
                    color="text.secondary"
                    fontStyle="italic"
                  >
                    Currently Used
                  </Typography>
                )}
              </Box>

              <IconButton
                onClick={(e) => {
                  e?.stopPropagation();

                  setAccountDetails(account);
                  setOpenConfirm(true);
                }}
                size="small"
                sx={{ mt: 0.5 }}
              >
                <XCircle size={18} color="red" weight="fill" />
              </IconButton>
            </MenuItem>
          ))}

          <MenuItem
            component={RouterLink}
            href={paths.dashboard.linkAccount()}
            onClick={onClose}
            sx={{ ml: 1 }}
          >
            <ListItemIcon sx={{ minWidth: "unset", color: "inherit" }}>
              <LinkSimple fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            <Typography>Add Another Account</Typography>
          </MenuItem>

          <MenuItem
            component={RouterLink}
            href={paths.dashboard.settings()}
            onClick={onClose}
            sx={{ ml: 1 }}
          >
            <ListItemIcon sx={{ minWidth: "unset", color: "inherit" }}>
              <GearSixIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            <Typography>Settings</Typography>
          </MenuItem>

          <MenuItem
            component={RouterLink}
            href={paths.dashboard.account()}
            onClick={onClose}
            sx={{ ml: 1 }}
          >
            <ListItemIcon sx={{ minWidth: "unset", color: "inherit" }}>
              <UserIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            <Typography>Profile</Typography>
          </MenuItem>

          <MenuItem onClick={handleSignOut} sx={{ ml: 1 }}>
            <ListItemIcon sx={{ minWidth: "unset", color: "inherit" }}>
              <SignOutIcon fontSize="var(--icon-fontSize-md)" />
            </ListItemIcon>
            <Typography>Sign out</Typography>
          </MenuItem>
        </MenuList>
      ) : (
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
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "#0E1E40", fontSize: isMobile ? 16 : undefined }}
            >
              Notifications
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="body2"
                sx={{ color: "#0E1E40", fontSize: isMobile ? 12 : 14 }}
              >
                Only show unread
              </Typography>
              <Switch
                checked={onlyUnread}
                onChange={() => setOnlyUnread(!onlyUnread)}
                color="success"
              />
            </Stack>
          </Grid>

          <Grid container justifyContent="space-between" mt={3} mb={3}>
            <Typography
              variant="body2"
              sx={{
                color: "grey.600",
                cursor: "pointer",
                fontSize: isMobile ? 12 : 14,
              }}
              onClick={(e) => {
                e?.stopPropagation();
                handleDeleteNotification();
              }}
            >
              Delete all
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "grey.600",
                cursor: "pointer",
                fontSize: isMobile ? 12 : 14,
              }}
              onClick={(e) => {
                e?.stopPropagation();
                handleMarkAllRead();
              }}
            >
              Mark all as read
            </Typography>
          </Grid>

          <List dense disablePadding>
            {notificationList?.notifications?.map((item) => (
              <Box
                key={item.id}
                onClick={(e) => {
                  e?.stopPropagation();
                  // handleNotificationClick(item);
                }}
              >
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 0,
                    py: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color="text.primary"
                        fontSize={isMobile ? 13 : 14}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontSize={isMobile ? 12 : 14}
                        >
                          {item.comments}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="grey.500"
                          fontSize={isMobile ? 10 : 12}
                        >
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

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={100}
          >
            {notificationLoader && <Loader />}
          </Box>
        </Paper>
      )}
      <ConfirmDialog
        open={openConfirm || switchConfirm}
        title={switchConfirm ? "Switch Account" : "Unlink Account"}
        message={`Are you sure want to ${
          switchConfirm ? "Switch" : "unlink"
        }  this ${accountDetails?.name}  Account ?`}
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (switchConfirm) {
            hanldeAccountClick();
            setSwitchConfirm(false);
          } else {
            handleCancelLink();
          }
        }}
        onCancel={() => {
          setOpenConfirm(false);
          setSwitchConfirm(false);
        }}
        loader={accountLoading}
      />
    </Popover>
  );
}
