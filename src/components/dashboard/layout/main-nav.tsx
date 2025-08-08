import * as React from "react";

import { Link as RouterLink } from "react-router-dom";

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

import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";
import { paths } from "@/utils/paths";

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  const userPopover = usePopover<HTMLDivElement>();

  const { dashBoardInfo, notificationList } = useSelector(
    (state: RootState) => state?.DashBoard
  );

  // const { user_name, email } = dashBoardInfo?.body?.customer || {};
  const CustomerInfo = getLocalStorage("intuity-customerInfo");

  const { user_name, loginID, company_logo, customer_name } =
    dashBoardInfo?.body?.customer || CustomerInfo || {};

  const [clickedType, setClickedType] = React.useState("");
  const getInitials = (name: string): string => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  };
  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          backgroundColor: "var(--mui-palette-background-paper)",
          position: "sticky",
          top: 0,
          zIndex: "var(--mui-zIndex-appBar)",
          boxShadow: 2, // 👈 MUI's default shadow level 2
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
              p: 3,
              backgroundColor: colors.white,

              borderRightColor: "var(--mui-palette-divider)",
              display: { xs: "none", lg: "flex" }, // 👈 visible on lg+, hidden below
            }}
          >
            <Box
              component={RouterLink}
              to={paths.dashboard.overview()}
              sx={{ display: "inline-flex" }}
            >
              <Logo color="dark" height={50} width={140} />
            </Box>
          </Stack>
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
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
              ref={userPopover.anchorRef}
              onClick={() => {
                // notificationPopover.handleOpen();
                setClickedType("notification");

                userPopover.handleOpen();
              }}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <Badge
                color="error"
                // badgeContent={notificationList?.notifications?.length} // 👈 show number here (can be dynamic)
                badgeContent={notificationList?.unread_count} // 👈 show number here (can be dynamic)
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

            {/* User Info Block */}
            <Box
              ref={userPopover.anchorRef}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                setClickedType("email");

                userPopover.handleOpen();
              }}
            >
              {/* <Avatar
                src={company_logo}
                sx={{ width: 40, height: 40, mr: 1.5 }}
              /> */}
              {/* <Avatar
                src={company_logo}
                sx={{ width: 40, height: 40, mr: 1.5 }}
              /> */}
              <Avatar
                // sx={{ bgcolor: "primary.main" }}
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
      <UserPopover
        type={clickedType}
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />

      {/* {notificationPopover.open && (
        <Box
          sx={{
            position: 'absolute',
            top: notificationPopover.anchorRef.current?.getBoundingClientRect().bottom + 8,
            left: notificationPopover.anchorRef.current?.getBoundingClientRect().left,
            zIndex: 1200,
            bgcolor: 'background.paper',
            boxShadow: 3,
            borderRadius: 1,
            p: 2,
            minWidth: 250,
          }}
        >
          <Typography variant="subtitle2">Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon or add your logic here
          </Typography>
        </Box>
      )} */}

      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
