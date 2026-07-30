import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import GlobalStyles from "@mui/material/GlobalStyles";

import { AuthGuard } from "@/components/auth/auth-guard";
import { MainNav } from "@/components/dashboard/layout/main-nav";
import { SideNav } from "@/components/dashboard/layout/side-nav";
import { useDispatch } from "@/hooks/redux";
import { getDashboardInfo } from "@/state/features/dashBoardSlice";
import { getLocalStorage, IntuityUser } from "@/utils/auth";
import { Outlet } from "react-router";

export default function DashboardLayout(): React.JSX.Element {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const raw = getLocalStorage("intuity-user");
    const stored: IntuityUser | null = typeof raw === "object" && raw !== null ? (raw as IntuityUser) : null;
    if (stored?.body?.acl_role_id && stored?.body?.customer_id) {
      dispatch(getDashboardInfo(stored.body.acl_role_id, stored.body.customer_id));
    }
  }, [dispatch]);

  return (
    <AuthGuard>
      <GlobalStyles
        styles={{
          body: {
            "--MainNav-height": "64px",
            "--MainNav-zIndex": 1000,
            "--SideNav-width": "280px",
            "--SideNav-zIndex": 1100,
            "--MobileNav-width": "320px",
            "--MobileNav-zIndex": 1100,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: "var(--mui-palette-background-default)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: "100%",
        }}
      >
        <SideNav />
        <MainNav />

        <Box
          sx={{
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            pl: { lg: "var(--SideNav-width)" },
          }}
        >
          <main>
            <Container maxWidth="xl" sx={{ py: "64px", pt: "21px" }}>
              {/* {children} */}
              <Outlet />
            </Container>
          </main>
        </Box>
      </Box>
    </AuthGuard>
  );
}
