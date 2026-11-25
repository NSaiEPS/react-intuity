import * as React from "react";

import {
  linkAnotherAccount,
  resetAccountStore,
  setUserInfo,
  updateAccountInfo,
} from "@/state/features/accountSlice";
import { getDashboardInfo, getNotificationList, resetDashboardStore } from "@/state/features/dashBoardSlice";
import { resetPaymentStore } from "@/state/features/paymentSlice";
import { RootState } from "@/state/store";
import { getLocalStorage, IntuityUser, setLocalStorage } from "@/utils/auth";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { UserCircle, XCircle } from "@phosphor-icons/react";
import { LinkSimple } from "@phosphor-icons/react/dist/ssr";
import { EnvelopeSimple as EnvelopeIcon } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { SignOut as SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import secureLocalStorage from "react-secure-storage";

import { authClient } from "@/lib/auth/client";
import { logger } from "@/lib/default-logger";
import { useUser } from "@/hooks/use-user";
import { ConfirmDialog } from "@/styles/theme/components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { paths } from "@/utils/paths";
import { useDispatch, useSelector } from "@/hooks/redux";
import { toast } from "@/lib/custom-toast";

interface AccountMenuListProps {
  onClose: () => void;
  isMobile: boolean;
}

export function AccountMenuList({ onClose, isMobile }: AccountMenuListProps): React.JSX.Element {
  const { checkSession } = useUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const raw = getLocalStorage("intuity-user");
  const stored: IntuityUser | null =
    typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;

  const roleId = stored?.body?.acl_role_id;
  const loginUserEmail = stored?.body?.email;
  const userId = stored?.body?.customer_id;
  const token = stored?.body?.token;

  const routeChecker = useSelector((state: RootState) => state?.DashBoard?.routeChecker);
  const { dashBoardInfo } = useSelector((state: RootState) => state?.DashBoard);
  const { accountLoading } = useSelector((state: RootState) => state?.Account);

  const linkedCustomerInfo = getLocalStorage("linked-customerInfo") as any[] | null;
  const linkedAccountsInfo = dashBoardInfo?.body?.linked_customers || linkedCustomerInfo || [];

  const [linkedAccounts, setLinkedAccounts] = React.useState([]);
  React.useEffect(() => {
    setLinkedAccounts(linkedAccountsInfo);
  }, [dashBoardInfo]);

  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [switchConfirm, setSwitchConfirm] = React.useState(false);
  const [accountDetails, setAccountDetails] = React.useState<any>({});
  const [isUnlinking, setIsUnlinking] = React.useState(false);

  const isBusy = accountLoading || isUnlinking;

  React.useEffect(() => {
    if (!accountLoading && isUnlinking) {
      const timer = setTimeout(() => setIsUnlinking(false), 400);
      return () => clearTimeout(timer);
    }
  }, [accountLoading, isUnlinking]);

  const confirmIfDirty = (onConfirm: () => void) => {
    if (routeChecker) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );
      if (confirmLeave) onConfirm();
    } else {
      onConfirm();
    }
  };

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("email", loginUserEmail);
      formData.append("acl_role_id", roleId);
      formData.append("customer_id", userId);

      confirmIfDirty(async () => {
        dispatch(resetDashboardStore());
        dispatch(resetPaymentStore());
        dispatch(resetAccountStore());
        const { error } = await authClient.signOut(token, formData);
        if (error) {
          logger.error("Sign out error", error);
          return;
        }
        await checkSession?.();
      });
    } catch (err) {
      logger.error("Sign out error", err);
    }
  }, [checkSession, routeChecker]);

  const successCallBackLinkedAccount = (data: any) => {
    const rawLatest = getLocalStorage("intuity-user");
    const currentStored =
      typeof rawLatest === "object" && rawLatest !== null ? (rawLatest as IntuityUser) : stored;
    const storeddata = { ...currentStored };
    storeddata.body = { ...storeddata.body, ...data };
    dispatch(setUserInfo(storeddata));
    setLocalStorage("intuity-user", storeddata);

    const newRoleId = storeddata?.body?.acl_role_id;
    const newUserId = storeddata?.body?.customer_id;
    if (newRoleId && newUserId) {
      dispatch(getDashboardInfo(newRoleId, newUserId));
    }

    const formData = new FormData();
    formData.append("acl_role_id", String(newRoleId));
    formData.append("customer_id", String(newUserId));
    formData.append("onlyread", "1");
    formData.append("page_no", "0");
    formData.append("markRead", "0");
    formData.append("model_open", "9");
    dispatch(getNotificationList(formData));
  };

  const handleAccountClick = (data = accountDetails) => {
    onClose();
    dispatch(resetDashboardStore());
    dispatch(resetPaymentStore());
    const formData = new FormData();
    formData.append("acl_role_id", String(stored?.body?.acl_role_id));
    formData.append("login", String(data?.link_customer_id ?? data?.customer_id));

    dispatch(linkAnotherAccount(formData, successCallBackLinkedAccount));
  };

  const handleCancelLink = () => {
    if (isBusy) return;
    setIsUnlinking(true);

    const targetAccount = accountDetails;
    const currentCustomerId = stored?.body?.customer_id;
    const isCurrentAccount =
      String(currentCustomerId) === String(targetAccount?.link_customer_id ?? targetAccount?.customer_id);

    const remainingAccounts = linkedAccounts.filter(
      (account: any) =>
        String(account?.link_customer_id ?? account?.customer_id ?? account?.id) !==
        String(targetAccount?.link_customer_id ?? targetAccount?.customer_id ?? targetAccount?.id)
    );

    const targetCustomerId = targetAccount?.link_customer_id ?? targetAccount?.customer_id;
    const formData = new FormData();
    formData.append("acl_role_id", String(roleId));
    formData.append("model_open", "7");
    formData.append("customer_id", String(targetCustomerId));

    dispatch(
      updateAccountInfo(formData, true, () => {
        setIsUnlinking(false);
        setLinkedAccounts(remainingAccounts);
        secureLocalStorage.setItem("linked-customerInfo", remainingAccounts);

        if (!isCurrentAccount) {
          // Scenario A: Removing an account that is NOT currently selected
          setOpenConfirm(false);
          setAccountDetails({});
          const currentRoleId = stored?.body?.acl_role_id;
          if (currentRoleId && currentCustomerId) {
            dispatch(getDashboardInfo(currentRoleId, currentCustomerId));
          }
        } else if (remainingAccounts.length > 0) {
          // Scenario B: Removing the account that IS currently selected
          setOpenConfirm(false);
          setAccountDetails({});
          const nextAccount = remainingAccounts[0];
          handleAccountClick(nextAccount);
        } else {
          // Scenario C: No remaining linked accounts
          setOpenConfirm(false);
          setAccountDetails({});
          onClose();
          dispatch(resetDashboardStore());
          dispatch(resetPaymentStore());
          secureLocalStorage.removeItem("intuity-customerInfo");
          navigate(paths.dashboard.linkAccount());
          toast.info("Account unlinked. Please link an account to continue.");
        }
      })
    ).catch(() => {
      setIsUnlinking(false);
    });
  };

  const handleClickPath = (route: string) => {
    confirmIfDirty(() => navigate(route));
    onClose();
  };

  const isTargetCurrent =
    String(stored?.body?.customer_id) === String(accountDetails?.link_customer_id ?? accountDetails?.customer_id);

  const remainingAfterUnlink = linkedAccounts.filter(
    (account: any) =>
      String(account?.link_customer_id ?? account?.customer_id ?? account?.id) !==
      String(accountDetails?.link_customer_id ?? accountDetails?.customer_id ?? accountDetails?.id)
  );

  const getUnlinkDialogMessage = () => {
    const accName = accountDetails?.name ? `"${accountDetails.name}"` : "this";
    if (remainingAfterUnlink.length === 0) {
      return `This is your only linked account. Unlinking ${accName} will remove your account access and redirect you to link an account.\n\nAre you sure you want to proceed?`;
    }
    if (isTargetCurrent) {
      return `This is your currently active account. Unlinking ${accName} will automatically switch you to your other linked account.\n\nAre you sure you want to proceed?`;
    }
    return `Are you sure you want to unlink ${accName} account?`;
  };

  return (
    <>
      <MenuList
        disablePadding
        sx={{
          p: "8px",
          pb: "24px",
          maxHeight: isMobile ? "calc(100vh - 120px)" : "calc(80vh - 50px)",
          overflowY: "auto",
          overflowX: "hidden",
          flex: "1 1 auto",
          "& .MuiMenuItem-root": { borderRadius: 1 },
        }}
      >
        {linkedAccounts.map((account) => (
          <MenuItem
            key={account?.link_customer_id}
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
              if (isBusy) return;
              if (stored?.body?.customer_id != account?.link_customer_id) {
                setAccountDetails(account);
                confirmIfDirty(() => setSwitchConfirm(true));
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
              <Typography component="span" fontSize={isMobile ? 11 : 13} color="text.secondary">
                ({account.email})
              </Typography>
              <Typography fontSize={isMobile ? 10 : 11} color="text.secondary" sx={{ mt: 0.5 }}>
                {account.company_name}
              </Typography>
              <Typography fontSize={isMobile ? 11 : 13} color="text.secondary">
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
              disabled={isBusy}
              onClick={(e) => {
                e?.stopPropagation();
                if (isBusy) return;
                setAccountDetails(account);
                setOpenConfirm(true);
              }}
              size="small"
              sx={{ mt: 0.5 }}
            >
              <XCircle size={18} color={isBusy ? "grey" : "red"} weight="fill" />
            </IconButton>
          </MenuItem>
        ))}

        <MenuItem onClick={() => handleClickPath(paths.dashboard.linkAccount())} sx={{ ml: 1 }}>
          <ListItemIcon sx={{ minWidth: "unset", color: "inherit" }}>
            <LinkSimple fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          <Typography>Add Another Account</Typography>
        </MenuItem>

        <MenuItem onClick={() => handleClickPath(paths.dashboard.service())} sx={{ ml: 1 }}>
          <ListItemIcon sx={{ minWidth: "unset", color: "inherit" }}>
            <EnvelopeIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          <Typography>Contact Us/Update Info</Typography>
        </MenuItem>

        <MenuItem onClick={() => handleClickPath(paths.dashboard.settings())} sx={{ ml: 1 }}>
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

      <ConfirmDialog
        open={openConfirm || switchConfirm}
        title={switchConfirm ? "Switch Account" : "Unlink Account"}
        message={
          switchConfirm
            ? `Are you sure want to switch to ${accountDetails?.name ? `"${accountDetails.name}"` : "this"} account?`
            : getUnlinkDialogMessage()
        }
        confirmLabel="Yes, Confirm"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (switchConfirm) {
            handleAccountClick();
            setSwitchConfirm(false);
          } else {
            handleCancelLink();
          }
        }}
        onCancel={() => {
          if (!isBusy) {
            setOpenConfirm(false);
            setSwitchConfirm(false);
            setAccountDetails({});
          }
        }}
        loader={isBusy}
      />
    </>
  );
}
