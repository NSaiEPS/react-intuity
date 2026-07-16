import * as React from "react";

import { useNavigate } from "react-router-dom";

import { RootState } from "@/state/store";
import { colors } from "@/utils";
import { getLocalStorage } from "@/utils/auth";
import { Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import { Bell, CaretDown } from "@phosphor-icons/react";

import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { useSelector } from "react-redux";

import { usePopover } from "@/hooks/use-popover";
import { Logo } from "@/components/core/logo";

const MobileNavLazy = React.lazy(() =>
  import("./mobile-nav").then((m) => ({ default: m.MobileNav }))
);
const UserPopoverLazy = React.lazy(() =>
  import("./user-popover").then((m) => ({ default: m.UserPopover }))
);
import { paths } from "@/utils/paths";

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [hasOpenedNav, setHasOpenedNav] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const userPopover = usePopover<HTMLDivElement>();
  const notificationPopover = usePopover<HTMLDivElement>();

  const { dashBoardInfo, notificationList } = useSelector(
    (state: RootState) => state?.DashBoard
  );

  interface AliasUser {
    company_name?: string;
    logo?: string;
  }

  // const { user_name, email } = dashBoardInfo?.body?.customer || {};
  const CustomerInfo = getLocalStorage("intuity-customerInfo") as Record<string, any> | null;
  const aliasUser: AliasUser | null = getLocalStorage("alias-details") as AliasUser | null;

  const { user_name, loginID, customer_name } =
    dashBoardInfo?.body?.customer || CustomerInfo || {};

  const [clickedType, setClickedType] = React.useState("");
  const getInitials = (name: string): string => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  };
  const routeChecker = useSelector(
    (state: RootState) => state?.DashBoard?.routeChecker
  );


  const handleLogoClickPath = () => {
    if (routeChecker) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );
      if (confirmLeave) {
        return navigate(paths.dashboard.overview())
      }
    }
    else {
      navigate(paths.dashboard.overview())
    }
  }

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          backgroundColor: "var(--mui-palette-background-paper)",
          position: "sticky",
          top: 0,
          zIndex: "var(--mui-zIndex-appBar)",
          boxShadow: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "64px",
            px: 2,
          }}
        >
          <Stack
            spacing={2}
            sx={{
              p: 1.8,
              backgroundColor: colors.white,

              borderRightColor: "var(--mui-palette-divider)",
              display: { xs: "none", lg: "flex" },
            }}
          >
            <Box
              // component={RouterLink}
              onClick={handleLogoClickPath}
              sx={{ display: "inline-flex" }}
            >
              {aliasUser ? (
                // <Avatar
                //   src={aliasUser?.logo}
                //   sx={{
                //     width: 70,
                //     height: "max-content",
                //     mr: 1.5,
                //     cursor: "pointer",
                //   }}
                // />

                <>

                  <Avatar
                    src={aliasUser?.logo}
                    sx={{
                      width: "max-content",
                      height: { xs: 50, sm: 60, md: 70 },
                      mr: { xs: 1, sm: 1.5 },
                      cursor: "pointer",
                      flexShrink: 0,
                      bgcolor: "#fff",
                      // border: "1px solid #e0e0e0",
                      borderRadius: "0",

                      "& img": {
                        objectFit: "contain",
                        // width: "100%",
                        // height: "100%",
                        // padding: "4px",
                      },
                    }}
                  />
                  <Typography sx={{fontSize:"22px", my:"auto", fontWeight:600}}>{aliasUser?.company_name}</Typography>
                </>
              ) : (
                <Logo
                  color="dark"
                  height={50}
                  width={140}
                  src={aliasUser ? aliasUser?.logo : null}
                />
              )}
            </Box>
          </Stack>
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setHasOpenedNav(true);
                setOpenNav(true);
              }}
              sx={{ display: { lg: "none" } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Notifications */}
            <Box
              ref={notificationPopover.anchorRef}
              onClick={() => {
                setClickedType("notification");
                requestAnimationFrame(() => {
                  notificationPopover.handleOpen();
                });
              }}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Badge
                color="error"
                badgeContent={notificationList?.unread_count}
                overlap="circular"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.75rem",
                    height: 18,
                    minWidth: 18,
                    top: 10,
                    right: 10,
                  },
                }}
              >
                <IconButton>
                  <Bell size={24} weight="regular" />
                </IconButton>
              </Badge>
            </Box>

            <Box
              ref={userPopover.anchorRef}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                setClickedType("email");
                requestAnimationFrame(() => {
                  userPopover.handleOpen();
                });
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  mr: 1.5,
                  bgcolor: colors.blue,
                  color: colors.white,
                }}
              >
                {getInitials(customer_name || "")}
              </Avatar>

              <Box sx={{ display: "flex", flexDirection: "column", mr: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {user_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {loginID}
                  {/* {updated_email} */}
                </Typography>
              </Box>
              <CaretDown size={16} />
            </Box>
          </Stack>
        </Stack>
      </Box>
      <React.Suspense fallback={null}>
        <UserPopoverLazy
          type={clickedType}
          anchorEl={userPopover.anchorRef.current}
          onClose={userPopover.handleClose}
          open={userPopover.open}
        />

        <UserPopoverLazy
          type={clickedType}
          anchorEl={notificationPopover.anchorRef.current}
          onClose={notificationPopover.handleClose}
          open={notificationPopover.open}
          openType={"email"}
        />
      </React.Suspense>

      {hasOpenedNav && (
        <React.Suspense fallback={null}>
          <MobileNavLazy
            onClose={() => setOpenNav(false)}
            open={openNav}
          />
        </React.Suspense>
      )}
    </React.Fragment>
  );
}
